import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePlans } from "./usePlans";
import { useRegistration } from "./useRegistration";
import { REGISTRATION_INITIAL_DATA } from "../types/registration";
import type { RegistrationData } from "../types/registration";
import { loadRegistrationDraft } from "../utils/registrationStorage";

export function usePlansPage() {
    const navigate = useNavigate();
    const { loading: registering, execute } = useRegistration();
    const { plans, loading, error, reload } = usePlans();
    const [state, setState] = useState(() => ({ selectedPlanId: null as number | null, draft: loadRegistrationDraft() }));
    const { selectedPlanId, draft } = state;

    const handleContract = useCallback(
        async (planId: number): Promise<void> => {
            if (registering || loading || !plans.some((plan) => plan.id === planId)) return;
            setState((previous) => ({ ...previous, selectedPlanId: planId }));
            const updated: RegistrationData = {
                ...(draft ?? REGISTRATION_INITIAL_DATA),
                planId,
            };
            const result = await execute(updated);
            if (result.success) {
                navigate("/cadastro/verificacao");
            } else {
                navigate("/cadastro", {
                    state: { registrationError: result.error ?? "Erro ao iniciar o cadastro. Tente novamente." },
                });
            }
        },
        [draft, execute, loading, navigate, plans, registering],
    );

    return { registering, plans, loading, error, reload, selectedPlanId, handleContract };
}
