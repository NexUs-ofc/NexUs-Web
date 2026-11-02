import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

const coreUrl = new URL("../src/services/coreClient.ts", import.meta.url).href;

registerHooks({
    resolve(specifier, context, nextResolve) {
        try {
            return nextResolve(specifier, context);
        } catch (error) {
            if (specifier.startsWith(".") && error.code === "ERR_MODULE_NOT_FOUND") return nextResolve(specifier + ".ts", context);
            throw error;
        }
    },
    load(url, context, nextLoad) {
        const result = nextLoad(url, context);
        if (url !== coreUrl) return result;
        return { ...result, source: String(result.source).replace("import.meta.env.VITE_CORE_API_BASE_URL", '"https://core.test"') };
    },
});

const { createStore, updateStore, getStore, getStores } = await import("../src/services/stores.service.ts");
const { EMPTY_STORE_FORM, toStoreForm, toStorePayload, toValidatedStoreData } = await import("../src/utils/validateStore.ts");
const { parseStore } = await import("../src/utils/parseStore.ts");

function response(overrides = {}) {
    return {
        id: 42, name: "Filial São Paulo", cnpj: "11222333000181",
        street: "Praça da Sé", number: "100", neighborhood: "Sé", city: "São Paulo", state: "SP",
        storeImageUrl: null, openingTime: null, closingTime: null,
        ...overrides,
    };
}

function form(phone) {
    return {
        ...EMPTY_STORE_FORM, ...toStoreForm(parseStore(response())),
        phone, email: "filial@example.com",
    };
}

for (const [national, international] of [
    ["(11) 96230-9631", "+5511962309631"],
    ["(11) 3230-9631", "+551132309631"],
    ["(55) 96230-9631", "+5555962309631"],
    ["(55) 3230-9631", "+555532309631"],
]) {
    test(`creates and edits ${national} using the international Core format`, async (t) => {
        const requests = [];
        t.mock.method(globalThis, "fetch", async (url, options) => {
            requests.push({ url, options });
            const body = JSON.parse(options.body);
            assert.deepEqual(body.phones, [international]);
            return Response.json(response({ phones: body.phones }));
        });

        const created = await createStore(form(national));
        const editForm = toStoreForm(created);
        assert.equal(editForm.phone, national);
        const updated = await updateStore("42", editForm);
        assert.equal(toStoreForm(updated).phone, national);
        assert.deepEqual(requests.map(({ url, options }) => [url, options.method]), [
            ["https://core.test/api/companies/me/stores", "POST"],
            ["https://core.test/api/companies/me/stores/42", "PATCH"],
        ]);
        assert.equal(JSON.parse(requests[0].options.body).email, "filial@example.com");
        assert.equal(Object.hasOwn(JSON.parse(requests[1].options.body), "email"), false);
    });

    test(`reads international and legacy ${national} without losing digits`, async (t) => {
        for (const phone of [international, national.replace(/\D/gu, ""), national]) {
            t.mock.method(globalThis, "fetch", async () => Response.json([response({ phones: [phone] })]));
            const [store] = await getStores();
            const editForm = toStoreForm(store);
            assert.equal(editForm.phone, national);
            assert.deepEqual(toStorePayload(toValidatedStoreData(editForm, "edit")).phones, [international]);
        }

        t.mock.method(globalThis, "fetch", async () => Response.json(response({ phones: [international] })));
        assert.equal(toStoreForm(await getStore("42")).phone, national);
    });
}

test("omits empty optional phones in POST and PATCH and handles responses without phones", async (t) => {
    t.mock.method(globalThis, "fetch", async (_url, options) => {
        assert.equal(Object.hasOwn(JSON.parse(options.body), "phones"), false);
        return Response.json(response());
    });
    const created = await createStore(form(""));
    assert.equal(toStoreForm(created).phone, "");
    assert.equal(toStoreForm(await updateStore("42", toStoreForm(created))).phone, "");
});

test("rejects incomplete phones before sending a request", async (t) => {
    const fetch = t.mock.method(globalThis, "fetch", () => { throw new Error("Unexpected request"); });
    for (const phone of ["(11) 96230-963", "(01) 96230-9631", "+5511962309631"]) {
        await assert.rejects(() => createStore(form(phone)), /telefone/u);
        await assert.rejects(() => updateStore("42", form(phone)), /telefone/u);
    }
    assert.equal(fetch.mock.callCount(), 0);
});

test("rejects invalid phone responses and preserves the server validation message", async (t) => {
    for (const phones of [["+5501962309631"], ["+55119623096"], ["123"], [null], "11962309631"]) {
        assert.throws(() => parseStore(response({ phones })), JSON.stringify(phones));
    }
    t.mock.method(globalThis, "fetch", async () => Response.json({ message: "phones: Telefone inválido" }, { status: 400 }));
    await assert.rejects(() => createStore(form("(11) 96230-9631")), /phones: Telefone inválido/u);
});
