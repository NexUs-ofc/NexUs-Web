import type { ProductRankingsData, RankedProduct } from "../types/rankings";
import { asNumber as number, asRecord as record, asText as text } from "./responseParsers";
import { BRAZILIAN_STATES } from "./validateStore";

function toRankedProduct(value: unknown): RankedProduct {
    const item = record(value);
    return { productId: text(item.productId, 200), score: number(item.score) };
}

function toRankedProducts(value: unknown): RankedProduct[] {
    if (!Array.isArray(value)) throw new Error("Lista de ranking inválida.");
    return value.map(toRankedProduct);
}

function toRankingState(value: unknown): string | null {
    if (value === null || value === undefined) return null;
    const state = text(value, 2);
    if (!BRAZILIAN_STATES.includes(state)) throw new Error("UF desconhecida no ranking.");
    return state;
}

export function toValidatedProductRankings(value: unknown): ProductRankingsData {
    const data = record(value);
    return {
        registered: toRankedProducts(data.registered),
        expired: toRankedProducts(data.expired),
        state: toRankingState(data.state),
    };
}
