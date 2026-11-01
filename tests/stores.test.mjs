import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";
import { createServer } from "vite";

// Usa a transformação TS/env do próprio Vite, sem duplicar o código de produção.
const server = await createServer({ configFile: false, server: { middlewareMode: true, ws: false }, appType: "custom", optimizeDeps: { noDiscovery: true } });
const stores = await server.ssrLoadModule("/src/services/stores.service.ts");
const { setCoreAuthToken } = await server.ssrLoadModule("/src/services/coreClient.ts");
const validation = await server.ssrLoadModule("/src/utils/validateStore.ts");
const { parseStores } = await server.ssrLoadModule("/src/utils/parseStore.ts");
const { apiRequest } = await server.ssrLoadModule("/src/services/apiClient.ts");
const { resolveStoreRouteId } = await server.ssrLoadModule("/src/utils/storeRoute.ts");
const originalFetch = globalThis.fetch;
const calls = [];
const responseStore = {
    id: 42, name: "Filial Paulista", cnpj: "11222333000181", storeImageUrl: "",
    street: "Avenida Paulista", number: "100", neighborhood: "Bela Vista", city: "São Paulo", state: "SP",
    latitude: -23.5, longitude: -46.6, distanceKm: 0.1, openingTime: "08:00", closingTime: "18:30",
};
const form = {
    ...validation.EMPTY_STORE_FORM, name: "  Filial Paulista  ", cnpj: "11.222.333/0001-81",
    street: "Avenida Paulista", number: "100", neighborhood: "Bela Vista", cep: "01310-100",
    city: "São Paulo", state: "sp", phone: "(11) 99999-9999",
    email: "FILIAL@example.com", openingTime: "08:00", closingTime: "18:30",
};

function reply(data, status = 200) {
    globalThis.fetch = async (url, options) => {
        calls.push({ url, ...options });
        return new Response(status === 204 ? null : JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
    };
}

beforeEach(() => { calls.length = 0; setCoreAuthToken("test-session-token"); reply(responseStore); });
after(async () => { globalThis.fetch = originalFetch; setCoreAuthToken(null); await server.close(); });

test("GET lista real usa o cliente autenticado e aceita coleção vazia", async () => {
    reply([responseStore]);
    const result = await stores.getStores();
    assert.equal(result[0].id, "42");
    assert.match(calls[0].url, /\/api\/companies\/me\/stores$/u);
    assert.equal(calls[0].method, "GET");
    assert.equal(calls[0].credentials, "include");
    assert.equal(calls[0].headers.Authorization, "Bearer test-session-token");
    reply([]);
    assert.deepEqual(await stores.getStores(), []);
});

test("GET individual recupera dados pelo ID e rejeita ID divergente", async () => {
    assert.equal((await stores.getStore("42")).street, responseStore.street);
    assert.match(calls[0].url, /\/stores\/42$/u);
    await assert.rejects(stores.getStore("43"), /diferente/u);
});

test("POST envia somente o contrato sanitizado, com telefone único em lista e horas HH:mm", async () => {
    const result = await stores.createStore(form);
    const request = calls[0];
    assert.equal(request.method, "POST");
    assert.deepEqual(JSON.parse(request.body), {
        cnpj: "11222333000181", name: "Filial Paulista", phones: ["11999999999"],
        address: { neighborhood: "Bela Vista", street: "Avenida Paulista", number: "100", cep: "01310100", city: "São Paulo", state: "SP" },
        openingTime: "08:00", closingTime: "18:30", email: "filial@example.com",
    });
    assert.equal(result.cep, "01310100");
    assert.deepEqual(result.phones, ["11999999999"]);
});

test("PATCH identifica a filial pelo ID no caminho e não envia e-mail nem foto", async () => {
    await stores.updateStore("42", { ...form, photoDataUrl: "https://example.com/store.jpg" });
    const request = calls[0];
    const body = JSON.parse(request.body);
    assert.equal(request.method, "PATCH");
    assert.match(request.url, /\/api\/companies\/me\/stores\/42$/u);
    assert.equal(body.cnpj, "11222333000181");
    assert.equal("email" in body, false);
    assert.equal("photoDataUrl" in body, false);
    assert.equal("id" in body, false);
});

test("PATCH omite CEP/telefones não informados e horários opcionais vazios", async () => {
    await stores.updateStore("42", { ...form, cep: "", phone: "", openingTime: "", closingTime: "" });
    const body = JSON.parse(calls[0].body);
    assert.equal("cep" in body.address, false);
    assert.equal("phones" in body, false);
    assert.equal("openingTime" in body, false);
    assert.equal("closingTime" in body, false);
});

test("DELETE aceita 204 sem JSON", async () => {
    reply(null, 204);
    assert.equal(await stores.deleteStore("42"), undefined);
    assert.equal(calls[0].method, "DELETE");
    assert.match(calls[0].url, /\/stores\/42$/u);
});

test("PUT imagem envia binário na chave file e deixa o browser definir boundary", async () => {
    reply({ profileId: 42, profileImageUrl: "https://example.com/photo.png" });
    const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/l9sAAAAASUVORK5CYII=";
    const result = await stores.updateStoreImage("42", png);
    const request = calls[0];
    assert.equal(request.method, "PUT");
    assert.match(request.url, /\/stores\/42\/image$/u);
    assert.equal(request.body instanceof FormData, true);
    assert.equal(request.body.get("file").type, "image/png");
    assert.ok(request.body.get("file").size > 0);
    assert.equal("Content-Type" in request.headers, false);
    assert.equal(request.headers.Authorization, "Bearer test-session-token");
    assert.equal(result.profileImageUrl, "https://example.com/photo.png");
});

test("DELETE imagem usa o endpoint autenticado e aceita URL nula", async () => {
    reply({ profileId: 42, profileImageUrl: null });
    assert.equal((await stores.deleteStoreImage("42")).profileImageUrl, "");
    assert.equal(calls[0].method, "DELETE");
    assert.match(calls[0].url, /\/stores\/42\/image$/u);
});

test("foto falsa, CNPJ inválido e horários impossíveis não geram requisição", async () => {
    await assert.rejects(stores.updateStoreImage("42", "data:image/png;base64,SGVsbG8="), /conteúdo/u);
    await assert.rejects(stores.createStore({ ...form, cnpj: "11.111.111/1111-11" }), /CNPJ/u);
    for (const time of ["24:00", "12:60", "8:00", "ab:cd"]) {
        await assert.rejects(stores.createStore({ ...form, openingTime: time }), /horário/u);
    }
    assert.equal(calls.length, 0);
});

test("máscara de horários formata digitação e colagem sem rejeitar turno noturno", () => {
    assert.equal(validation.maskStoreTime("0800"), "08:00");
    assert.equal(validation.maskStoreTime("18:30"), "18:30");
    assert.equal(validation.maskStoreTime("083"), "08:3");
    assert.equal(validation.maskStoreTime(""), "");
    assert.equal(validation.isStoreFormValid(validation.validateStoreForm({ ...form, openingTime: "22:00", closingTime: "06:00" }, "create")), true);
});

test("campos opcionais podem ficar vazios e o formulário aceita somente um telefone", async () => {
    await stores.createStore({ ...form, cep: "", phone: "", openingTime: "", closingTime: "" });
    const body = JSON.parse(calls[0].body);
    assert.equal("phones" in body, false);
    assert.equal("openingTime" in body, false);
    assert.equal(validation.maskStorePhone("11999999999"), "(11) 99999-9999");
    assert.equal(validation.maskStorePhone("1133334444"), "(11) 3333-4444");
    await assert.rejects(stores.createStore({ ...form, phone: "(11) 99999-9999, (11) 3333-4444" }), /telefone/u);
    for (const field of ["name", "cnpj", "street", "email"]) await assert.rejects(stores.createStore({ ...form, [field]: "" }));
    assert.equal(calls.length, 1);
});

test("respostas externas inválidas não entram na coleção", async () => {
    for (const value of [{}, [responseStore, responseStore], [{ ...responseStore, id: "42" }], [{ ...responseStore, storeImageUrl: "javascript:alert(1)" }], [{ ...responseStore, openingTime: "25:00" }]]) {
        assert.throws(() => parseStores(value));
    }
    reply({ message: "Sessão expirada" }, 401);
    await assert.rejects(stores.getStores(), (error) => error.status === 401 && error.message === "Sessão expirada");
});

test("IDs inválidos são rejeitados antes da rede", async () => {
    for (const id of ["", "../42", "-1", "abc", "9007199254740992"]) await assert.rejects(stores.deleteStore(id), /Identificador/u);
    assert.equal(calls.length, 0);
});

test("AbortSignal atravessa o cliente e erro de rede é apresentado sem fallback mock", async () => {
    const controller = new AbortController();
    controller.abort();
    globalThis.fetch = async (_url, options) => {
        assert.equal(options.signal, controller.signal);
        options.signal.throwIfAborted();
    };
    await assert.rejects(stores.getStores({ signal: controller.signal }), /cancelada/u);
    globalThis.fetch = async () => { throw new TypeError("Failed to fetch"); };
    await assert.rejects(stores.getStores(), /conectar/u);
});

test("transporte JSON de autenticação/perfil continua incluindo os headers existentes", async () => {
    reply({ ok: true });
    await apiRequest("https://example.com", "/auth", { method: "POST", apiKey: "test-key", body: { example: true } });
    assert.equal(calls[0].headers["Content-Type"], "application/json");
    assert.equal(calls[0].headers["X-API-KEY"], "test-key");
    assert.equal(calls[0].body, '{"example":true}');
});


test("edit route rejects missing and invalid IDs before requesting the core", () => {
    for (const value of [undefined, "", "abc", "-1", "../42", "1.5", "9007199254740992"]) {
        const result = resolveStoreRouteId(value);
        assert.equal(result.id, undefined);
        assert.ok(result.error);
    }
    assert.equal(calls.length, 0);
});

test("edit route normalizes valid IDs and preserves zero", () => {
    assert.deepEqual(resolveStoreRouteId("42"), { id: "42", error: "" });
    assert.deepEqual(resolveStoreRouteId("0042"), { id: "42", error: "" });
    assert.deepEqual(resolveStoreRouteId("0"), { id: "0", error: "" });
});
