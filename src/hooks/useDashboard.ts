import { useCallback, useEffect, useState } from "react";
import { getDashboard } from "../services/dashboard.service";
import { getBrazilStatesMap } from "../services/geography.service";
import type { DashboardData } from "../types/dashboard";
import { useAuth } from "./useAuth";

interface DashboardLoadState {
    data: DashboardData | null;
    mapSource: string | null;
    loading: boolean;
    error: string;
    revision: number;
}

export interface UseDashboardResult extends Omit<DashboardLoadState, "revision"> {
    companyName: string;
    reload: () => void;
}

export function useDashboard(): UseDashboardResult {
    const { state: auth } = useAuth();
    const [state, setState] = useState<DashboardLoadState>({ data: null, mapSource: null, loading: true, error: "", revision: 0 });

    useEffect(() => {
        const controller = new AbortController();
        void Promise.all([
            getDashboard({ signal: controller.signal }),
            getBrazilStatesMap({ signal: controller.signal }),
        ]).then(([data, mapSource]) => {
            if (!controller.signal.aborted) setState((previous) => ({ ...previous, data, mapSource, loading: false, error: "" }));
        }).catch((error: unknown) => {
            if (!controller.signal.aborted) setState((previous) => ({ ...previous, loading: false, error: error instanceof Error ? error.message : "Erro ao carregar o dashboard." }));
        });
        return () => controller.abort();
    }, [state.revision]);

    const reload = useCallback((): void => {
        setState((previous) => ({ ...previous, loading: true, error: "", revision: previous.revision + 1 }));
    }, []);

    return { data: state.data, mapSource: state.mapSource, loading: state.loading, error: state.error, companyName: auth.profile?.name ?? "", reload };
}
