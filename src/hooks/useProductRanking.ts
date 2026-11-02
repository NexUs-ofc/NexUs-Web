import { useEffect, useState } from "react";
import { getProductRankings } from "../services/rankings.service";
import type { RankedProduct, RankingCategory } from "../types/rankings";

interface RankingResult {
    items: ReadonlyArray<RankedProduct>;
    loading: boolean;
    error: string;
}

export interface UseProductRankingResult {
    state: string;
    items: ReadonlyArray<RankedProduct>;
    loading: boolean;
    error: string;
    setState: (state: string) => void;
}

/**
 * Ranking de produtos de uma categoria ("registered" ou "expired"), com filtro de UF próprio.
 * Cada card do dashboard usa sua própria instância: trocar o estado de um não afeta o outro,
 * e cada troca de filtro cancela a busca anterior (AbortController) antes de disparar a nova.
 */
export function useProductRanking(category: RankingCategory): UseProductRankingResult {
    const [state, setStateValue] = useState("");
    const [result, setResult] = useState<RankingResult>({ items: [], loading: true, error: "" });

    useEffect(() => {
        const controller = new AbortController();
        void getProductRankings(state || null, { signal: controller.signal })
            .then((data) => {
                if (controller.signal.aborted) return;
                setResult({ items: data[category], loading: false, error: "" });
            })
            .catch((caught: unknown) => {
                if (controller.signal.aborted) return;
                setResult({ items: [], loading: false, error: caught instanceof Error ? caught.message : "Não foi possível carregar o ranking." });
            });
        return () => controller.abort();
    }, [category, state]);

    function setState(nextState: string): void {
        // O reset para "carregando" acontece aqui (no handler do seletor), não dentro do efeito.
        setStateValue(nextState);
        setResult((previous) => ({ ...previous, loading: true, error: "" }));
    }

    return { state, items: result.items, loading: result.loading, error: result.error, setState };
}
