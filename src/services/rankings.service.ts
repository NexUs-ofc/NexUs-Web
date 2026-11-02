/**
 * Acesso ao endpoint de rankings de produtos (NexUs-BI-AI / app/controller/ranking_controller.py).
 *
 * Contrato: GET /api/rankings/products[?state=UF] → { registered, expired, state }
 * Roda no mesmo backend e usa a mesma autenticação do chatbot (X-API-Key + Bearer),
 * por isso reaproveita o chatbotClient em vez de criar um client HTTP novo.
 */
import type { ProductRankingsData } from "../types/rankings";
import { toValidatedProductRankings } from "../utils/validateRankings";
import { chatbotRequest, describeChatbotError } from "./chatbotClient";

export interface RankingsRequestOptions { signal?: AbortSignal; }

/** Busca os rankings "mais registrados" e "mais vencidos". `state` nulo/vazio = ranking geral. */
export async function getProductRankings(
    state: string | null,
    options: RankingsRequestOptions = {},
): Promise<ProductRankingsData> {
    try {
        const endpoint = state ? `/api/rankings/products?state=${encodeURIComponent(state)}` : "/api/rankings/products";
        const data = await chatbotRequest<unknown>(endpoint, options.signal ? { signal: options.signal } : {});
        return toValidatedProductRankings(data);
    } catch (error) {
        if (options.signal?.aborted) throw error;
        throw new Error(
            describeChatbotError(
                error,
                "Não foi possível carregar o ranking de produtos.",
                {
                    unavailable: "Dados de ranking indisponíveis no momento. Tente novamente em instantes.",
                    forbidden: "Sem permissão para acessar os rankings.",
                },
            ),
            { cause: error },
        );
    }
}
