import { useCallback, useEffect, useRef, useState } from "react";
import { changeCompanyPlan, getCompany } from "../services/plans.service";
import type { Company } from "../types/company";

export function useCompanyPlan() {
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
    const [pendingPlanId, setPendingPlanId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [revision, setRevision] = useState(0);
    const updateController = useRef<AbortController | null>(null);

    useEffect(() => {
        const controller = new AbortController();
        void getCompany({ signal: controller.signal }).then((data) => {
            if (!controller.signal.aborted) setCompany(data);
        }).catch((cause: unknown) => {
            if (!controller.signal.aborted) {
                setError(cause instanceof Error ? cause.message : "Não foi possível carregar o plano atual.");
            }
        }).finally(() => {
            if (!controller.signal.aborted) setLoading(false);
        });
        return () => controller.abort();
    }, [revision]);

    useEffect(() => () => updateController.current?.abort(), []);

    const reload = useCallback(() => {
        setLoading(true);
        setError("");
        setSuccess("");
        setRevision((value) => value + 1);
    }, []);

    const changePlan = useCallback(async (planId: number): Promise<void> => {
        if (loading || !company || company.planId === planId || updateController.current) return;
        const controller = new AbortController();
        updateController.current = controller;
        setPendingPlanId(planId);
        setError("");
        setSuccess("");
        try {
            const updated = await changeCompanyPlan(planId, { signal: controller.signal });
            if (controller.signal.aborted) return;
            setCompany(updated);
            if (updated.planId !== planId) {
                setError("A API não confirmou o plano solicitado. Confira seu plano atual e tente novamente.");
                return;
            }
            setSuccess(`Plano ${updated.planName} contratado com sucesso.`);
        } catch (cause: unknown) {
            if (!controller.signal.aborted) {
                setError(cause instanceof Error ? cause.message : "Não foi possível alterar o plano. Tente novamente.");
            }
        } finally {
            if (!controller.signal.aborted) setPendingPlanId(null);
            if (updateController.current === controller) updateController.current = null;
        }
    }, [company, loading]);

    return { company, loading, pendingPlanId, error, success, reload, changePlan };
}
