import { useCallback, useEffect, useState } from "react";
import { listReports } from "../services/reports.service";
import type { ReportsList } from "../types/report";

interface ReportsLoadState {
    data: ReportsList | null;
    error: string;
    /** Chave (revisão) da última requisição concluída; difere da atual enquanto carrega. */
    settledKey: string | null;
    revision: number;
}

export interface UseReportsResult {
    data: ReportsList | null;
    loading: boolean;
    error: string;
    reload: () => void;
}

export function useReports(): UseReportsResult {
    const [state, setState] = useState<ReportsLoadState>({ data: null, error: "", settledKey: null, revision: 0 });
    const { revision } = state;
    const requestKey = `${revision}`;

    useEffect(() => {
        const controller = new AbortController();
        const key = `${revision}`;
        listReports({ signal: controller.signal }).then((data) => {
            // Evita atualizar o estado depois de desmontar.
            if (!controller.signal.aborted) setState((previous) => ({ ...previous, data, error: "", settledKey: key }));
        }).catch((error: unknown) => {
            if (!controller.signal.aborted) {
                const message = error instanceof Error ? error.message : "Erro ao carregar os relatórios.";
                setState((previous) => ({ ...previous, error: message, settledKey: key }));
            }
        });
        return () => controller.abort();
    }, [revision]);

    // Estável: é repassado a um botão e não precisa mudar a cada render.
    const reload = useCallback((): void => {
        setState((previous) => ({ ...previous, revision: previous.revision + 1 }));
    }, []);

    return { data: state.data, loading: state.settledKey !== requestKey, error: state.settledKey === requestKey ? state.error : "", reload };
}
