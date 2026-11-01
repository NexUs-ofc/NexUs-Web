import { useCallback, useEffect, useRef, useState } from "react";
import { changeCompanyPlan, getCompany } from "../services/plans.service";
import type { Company } from "../types/company";
import { usePlans } from "./usePlans";

export function useCompanyPlan() {
    const [state, setState] = useState({ company: null as Company | null, loading: true, pendingPlanId: null as number | null, error: "", success: "", revision: 0 });
    const { company, loading, pendingPlanId, error, success, revision } = state;
    const { plans, loading: plansLoading, error: plansError, reload: reloadPlans } = usePlans();

    const updateController = useRef<AbortController | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        void getCompany({ signal: controller.signal }).then((data) => {
            if (!controller.signal.aborted) setState((previous) => ({ ...previous, company: data }));
        }).catch((cause: unknown) => {
            if (!controller.signal.aborted) {
                setState((previous) => ({ ...previous, error: cause instanceof Error ? cause.message : "Não foi possível carregar o plano atual." }));
            }
        }).finally(() => {
            if (!controller.signal.aborted) setState((previous) => ({ ...previous, loading: false }));
        });
        return () => controller.abort();
    }, [revision]);

    useEffect(() => () => updateController.current?.abort(), []);

    const reload = useCallback(() => {
        reloadPlans();
        setState((previous) => ({ ...previous, company: null, loading: true, error: "", success: "", revision: previous.revision + 1 }));
    }, [reloadPlans]);

    const changePlan = useCallback(async (planId: number): Promise<void> => {
        if (
            loading || plansLoading || plansError || !company || company.planId === planId ||
            !plans.some((plan) => plan.id === planId) || updateController.current
        ) return;
        const controller = new AbortController();
        updateController.current = controller;
        setState((previous) => ({ ...previous, pendingPlanId: planId, error: "", success: "" }));
        try {
            const updated = await changeCompanyPlan(planId, { signal: controller.signal });
            if (controller.signal.aborted) return;
            setState((previous) => ({ ...previous, company: updated }));
            if (updated.planId !== planId) {
                setState((previous) => ({ ...previous, error: "A API não confirmou o plano solicitado. Confira seu plano atual e tente novamente." }));
                return;
            }
            setState((previous) => ({ ...previous, success: `Plano ${updated.planName} contratado com sucesso.` }));
        } catch (cause: unknown) {
            if (!controller.signal.aborted) {
                setState((previous) => ({ ...previous, error: cause instanceof Error ? cause.message : "Não foi possível alterar o plano. Tente novamente." }));
            }
        } finally {
            if (!controller.signal.aborted) setState((previous) => ({ ...previous, pendingPlanId: null }));
            if (updateController.current === controller) updateController.current = null;
        }
    }, [company, loading, plans, plansLoading, plansError]);

    return { company, plans, loading: loading || plansLoading, pendingPlanId, error: error || plansError, success, reload, changePlan };
}
