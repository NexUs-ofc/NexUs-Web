import { useCallback, useEffect, useState } from "react";
import { getPlans } from "../services/plans.service";
import type { Plan } from "../types/plan";

export function usePlans() {
    const [state, setState] = useState({ plans: [] as Plan[], loading: true, error: "", revision: 0 });
    const { plans, loading, error, revision } = state;

    useEffect(() => {
        const controller = new AbortController();
        void getPlans({ signal: controller.signal }).then((data) => {
            if (!controller.signal.aborted) setState((previous) => ({ ...previous, plans: data }));
        }).catch((cause: unknown) => {
            if (!controller.signal.aborted) {
                setState((previous) => ({ ...previous, error: cause instanceof Error ? cause.message : "Não foi possível carregar os planos disponíveis." }));
            }
        }).finally(() => {
            if (!controller.signal.aborted) setState((previous) => ({ ...previous, loading: false }));
        });
        return () => controller.abort();
    }, [revision]);

    const reload = useCallback(() => {
        setState((previous) => ({ ...previous, plans: [], loading: true, error: "", revision: previous.revision + 1 }));
    }, []);

    return { plans, loading, error, reload };
}
