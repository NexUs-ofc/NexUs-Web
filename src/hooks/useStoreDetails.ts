import { useCallback, useEffect, useState } from "react";
import { getStore } from "../services/stores.service";
import type { Store } from "../types/store";

export interface UseStoreDetailsResult {
    store: Store | null;
    loading: boolean;
    error: string;
    reload: () => void;
}

export function useStoreDetails(summary: Store): UseStoreDetailsResult {
    const [state, setState] = useState({ store: null as Store | null, loading: true, error: "", revision: 0 });
    const reload = useCallback((): void => setState((previous) => ({ ...previous, loading: true, error: "", revision: previous.revision + 1 })), []);
    useEffect(() => {
        const controller = new AbortController();
        void getStore(summary.id, { signal: controller.signal }).then((store) => {
            if (!controller.signal.aborted) setState((previous) => ({ ...previous, loading: false, error: "", store: {
                ...store, cep: store.cep ?? summary.cep, phones: store.phones ?? summary.phones,
            } }));
        }).catch((error: unknown) => {
            if (!controller.signal.aborted) setState((previous) => ({ ...previous, loading: false, error: error instanceof Error ? error.message : "Não foi possível carregar a filial." }));
        });
        return () => controller.abort();
    }, [summary, state.revision]);
    return { store: state.store, loading: state.loading, error: state.error, reload };
}
