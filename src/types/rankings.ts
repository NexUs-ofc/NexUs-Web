/** Contratos do ranking de produtos (NexUs-BI-AI, GET /api/rankings/products). */

export type RankingCategory = "registered" | "expired";

export interface RankedProduct {
    productId: string;
    productName: string;
    score: number;
}

export interface ProductRankingsData {
    registered: ReadonlyArray<RankedProduct>;
    expired: ReadonlyArray<RankedProduct>;
    state: string | null;
}
