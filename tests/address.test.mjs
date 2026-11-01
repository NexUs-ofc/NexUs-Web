import assert from "node:assert/strict";
import { after, beforeEach, test } from "node:test";
import { createServer } from "vite";

const server = await createServer({ configFile: false, server: { middlewareMode: true, ws: false }, appType: "custom", optimizeDeps: { noDiscovery: true } });
const { getAddressByCep } = await server.ssrLoadModule("/src/services/address.service.ts");
const { parsePostalAddress } = await server.ssrLoadModule("/src/utils/validateAddress.ts");
const { setCoreAuthToken } = await server.ssrLoadModule("/src/services/coreClient.ts");
const originalFetch = globalThis.fetch;
const calls = [];
const responseAddress = {
    cep: "01001-000", logradouro: "Praça da Sé", complemento: "lado ímpar", bairro: "Sé", localidade: "São Paulo", uf: "SP",
};

function reply(data, status = 200) {
    globalThis.fetch = async (url, options) => {
        calls.push({ url, ...options });
        return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
    };
}

beforeEach(() => { calls.length = 0; setCoreAuthToken("test-core-token"); reply(responseAddress); });
after(async () => { globalThis.fetch = originalFetch; setCoreAuthToken(null); await server.close(); });

test("CEP completo consulta ViaCEP sem credenciais do core e mapeia os campos", async () => {
    const result = await getAddressByCep("01001-000");
    assert.deepEqual(result, { cep: "01001000", street: "Praça da Sé", neighborhood: "Sé", city: "São Paulo", state: "SP" });
    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /\/ws\/01001000\/json\/$/u);
    assert.equal(calls[0].method, "GET");
    assert.equal(calls[0].credentials, "omit");
    assert.deepEqual(calls[0].headers, {});
    assert.equal(calls[0].body, undefined);
    assert.equal("number" in result, false);
});

test("CEP inválido não provoca requisição", async () => {
    for (const cep of ["", "0100100", "010010000", "01001A00", "../01001000", "01001 000"]) {
        await assert.rejects(getAddressByCep(cep), /CEP válido/u);
    }
    assert.equal(calls.length, 0);
});

test("CEP inexistente é tratado mesmo quando o HTTP retorna 200", async () => {
    for (const erro of [true, "true"]) {
        reply({ erro });
        await assert.rejects(getAddressByCep("99999999"), /CEP não encontrado/u);
    }
});

test("CEP sem rua ou bairro pede CEP válido e não libera endereço incompleto", async () => {
    for (const field of ["logradouro", "bairro"]) {
        reply({ ...responseAddress, [field]: "" });
        await assert.rejects(getAddressByCep("01001000"), /Insira um CEP válido com rua e bairro/u);
    }
});

test("respostas com tipos inválidos, UF inválida ou CEP diferente são rejeitadas", () => {
    for (const value of [null, [], {}, { ...responseAddress, cep: "01310-100" }, { ...responseAddress, localidade: "" },
        { ...responseAddress, uf: "XX" }, { ...responseAddress, bairro: 42 }, { ...responseAddress, logradouro: "x".repeat(201) }]) {
        assert.throws(() => parsePostalAddress(value, "01001000"));
    }
});

test("respostas externas são reconstruídas e textos têm controles removidos", () => {
    const result = parsePostalAddress({ ...responseAddress, localidade: " São Paulo\n ", uf: "sp", extra: "ignorar" }, "01001000");
    assert.equal(result.city, "São Paulo");
    assert.equal(result.state, "SP");
    assert.equal("extra" in result, false);
});

test("erros HTTP e de conexão são propagados para o formulário", async () => {
    reply({ message: "Consulta indisponível" }, 503);
    await assert.rejects(getAddressByCep("01001000"), (error) => error.status === 503 && error.message === "Consulta indisponível");
    globalThis.fetch = async () => { throw new TypeError("Failed to fetch"); };
    await assert.rejects(getAddressByCep("01001000"), /conectar/u);
});

test("consulta passa o AbortSignal para o transporte", async () => {
    const controller = new AbortController();
    controller.abort();
    globalThis.fetch = async (_url, options) => {
        assert.equal(options.signal, controller.signal);
        options.signal.throwIfAborted();
    };
    await assert.rejects(getAddressByCep("01001000", { signal: controller.signal }), /cancelada/u);
});
