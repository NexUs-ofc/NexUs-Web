import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { registerHooks } from "node:module";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const chatbotUrl = new URL("../src/services/chatbotClient.ts", import.meta.url).href;

registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier.endsWith(".css")) return { url: "data:text/javascript,export default {}", shortCircuit: true };
        try {
            return nextResolve(specifier, context);
        } catch (error) {
            if (specifier.startsWith(".") && ["ERR_MODULE_NOT_FOUND", "ERR_UNSUPPORTED_DIR_IMPORT"].includes(error.code)) {
                for (const suffix of [".ts", ".tsx", "/index.tsx"]) {
                    if (existsSync(new URL(specifier + suffix, context.parentURL))) return nextResolve(specifier + suffix, context);
                }
            }
            throw error;
        }
    },
    load(url, context, nextLoad) {
        if (url === chatbotUrl) return {
            format: "module", shortCircuit: true,
            source: "export const requests = []; let response; export function respondWith(value) { requests.length = 0; response = value; } export async function chatbotRequest(endpoint) { requests.push(endpoint); return response; } export function describeChatbotError(error) { return error.message; }",
        };
        if (!url.endsWith(".tsx")) return nextLoad(url, context);
        return {
            format: "module", shortCircuit: true,
            source: ts.transpileModule(readFileSync(new URL(url), "utf8"), {
                compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext },
            }).outputText,
        };
    },
});

const { getProductRankings } = await import("../src/services/rankings.service.ts");
const { toValidatedProductRankings } = await import("../src/utils/validateRankings.ts");
const { default: ProductRankingCard } = await import("../src/components/ProductRankingCard/index.tsx");
const { requests, respondWith } = await import(chatbotUrl);

function response() {
    return {
        registered: [{ productId: "42", productName: "Banana", score: 8 }],
        expired: [{ productId: "19", productName: "Leite", score: 3 }],
        state: null,
    };
}

function render(items, overrides = {}) {
    return renderToStaticMarkup(createElement(ProductRankingCard, {
        title: "Ranking", subtitle: "Produtos registrados", icon: null,
        state: "", items, loading: false, error: "", emptyMessage: "Nenhum produto encontrado.",
        onStateChange() {}, ...overrides,
    }));
}

test("loads general and state rankings through BI-AI while preserving food IDs and names", async () => {
    respondWith(response());
    const general = await getProductRankings(null);
    assert.deepEqual(general, response());
    assert.deepEqual(requests, ["/api/rankings/products"]);

    respondWith({ ...response(), state: "SP" });
    const state = await getProductRankings("SP");
    assert.equal(state.state, "SP");
    assert.deepEqual(requests, ["/api/rankings/products?state=SP"]);
});

test("renders food names for numeric IDs without hiding products or changing their order", () => {
    const items = toValidatedProductRankings(response()).registered;
    const markup = render([...items, { productId: "19", productName: "Arroz", score: 4 }]);

    assert.match(markup, /product-ranking-card__name">Banana</u);
    assert.match(markup, /product-ranking-card__name">Arroz</u);
    assert.ok(markup.indexOf("Banana") < markup.indexOf("Arroz"));
    assert.doesNotMatch(markup, /product-ranking-card__name">42</u);
    assert.doesNotMatch(markup, /Nenhum produto encontrado/u);
});

test("rejects missing or blank catalog names instead of displaying IDs as names", () => {
    for (const productName of [undefined, null, "", "   "]) {
        const data = response();
        data.registered[0].productName = productName;
        assert.throws(() => toValidatedProductRankings(data));
    }
});

test("rejects repeated IDs within either ranking and allows the same food in separate rankings", () => {
    for (const category of ["registered", "expired"]) {
        const data = response();
        data[category].push({ ...data[category][0], productName: "Outro nome" });
        assert.throws(() => toValidatedProductRankings(data), /duplicados/u);
    }
    const data = response();
    data.expired[0].productId = data.registered[0].productId;
    assert.equal(toValidatedProductRankings(data).expired[0].productId, "42");
});

test("keeps an empty state ranking empty and shows loading and failures separately", async () => {
    respondWith({ registered: [], expired: [], state: "AC" });
    const state = await getProductRankings("AC");
    assert.match(render(state.registered), /Nenhum produto encontrado/u);
    assert.doesNotMatch(render(state.registered), /product-ranking-card__list/u);
    assert.doesNotMatch(render([], { loading: true }), /Nenhum produto encontrado/u);
    assert.match(render([], { error: "Serviço indisponível" }), /Serviço indisponível/u);
    assert.doesNotMatch(render([], { error: "Serviço indisponível" }), /Nenhum produto encontrado/u);
});
