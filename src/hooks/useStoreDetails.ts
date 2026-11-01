import { useCallback, useEffect, useState } from "react";
import { getStore } from "../services/stores.service";
import type { Store } from "../types/store";

export interface UseStoreDetailsResult {
    store: Store | null;
    loading: boolean;
    error: string;
    reload: () => void;
}

export function useStoreDetails(id: string | undefined, summary?: Store): UseStoreDetailsResult {
    const [state, setState] = useState({ store: null as Store | null, loading: true, error: "", requestedId: id, revision: 0 });
    const reload = useCallback((): void => setState((previous) => ({ ...previous, loading: true, error: "", revision: previous.revision + 1 })), []);
    useEffect(() => {
        if (id === undefined) return;
        const controller = new AbortController();
        void getStore(id, { signal: controller.signal }).then((store) => {
            if (!controller.signal.aborted) setState((previous) => ({ ...previous, loading: false, error: "", requestedId: id, store }));
        }).catch((error: unknown) => {
            if (!controller.signal.aborted) setState((previous) => ({ ...previous, loading: false, requestedId: id, error: error instanceof Error ? error.message : "Não foi possível carregar a filial." }));
        });
        return () => controller.abort();
    }, [id, state.revision]);
    const current = state.requestedId === id;
    return { store: current && state.store ? { ...state.store, cep: state.store.cep ?? summary?.cep, phones: state.store.phones ?? summary?.phones } : null, loading: id !== undefined && (!current || state.loading), error: current ? state.error : "", reload };
}
