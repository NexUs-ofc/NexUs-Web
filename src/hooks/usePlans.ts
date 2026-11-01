import { useCallback, useEffect, useState } from "react";
import { getPlans } from "../services/plans.service";
import type { Plan } from "../types/plan";

export function usePlans() {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [revision, setRevision] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        void getPlans({ signal: controller.signal }).then((data) => {
            if (!controller.signal.aborted) setPlans(data);
        }).catch((cause: unknown) => {
            if (!controller.signal.aborted) {
                setError(cause instanceof Error ? cause.message : "Não foi possível carregar os planos disponíveis.");
            }
        }).finally(() => {
            if (!controller.signal.aborted) setLoading(false);
        });
        return () => controller.abort();
    }, [revision]);

    const reload = useCallback(() => {
        setPlans([]);
        setLoading(true);
        setError("");
        setRevision((value) => value + 1);
    }, []);

    return { plans, loading, error, reload };
}
