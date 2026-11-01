import { useEffect, useState } from "react";
import { getCompany } from "../services/plans.service";
import type { Company } from "../types/company";
import type { Profile } from "../types/profile";

export function useCompanyDetails(profile: Profile) {
    const enabled = profile.profileType === "COMPANY";
    const [state, setState] = useState({
        attempt: 0,
        company: null as Company | null,
        loading: enabled,
        error: "",
    });

    useEffect(() => {
        if (!enabled) return;

        const controller = new AbortController();
        const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]);

        void getCompany({ signal }).then((company) => {
            if (!signal.aborted) setState((previous) => ({ ...previous, company, loading: false, error: "" }));
        }).catch(() => {
            if (!controller.signal.aborted) setState((previous) => ({ ...previous,
                company: null,
                loading: false,
                error: "Não foi possível carregar os dados da empresa. Tente novamente.",
            }));
        });

        return () => controller.abort();
    }, [state.attempt, enabled, profile.id]);

    function retry(): void {
        setState((previous) => ({ company: null, loading: true, error: "", attempt: previous.attempt + 1 }));
    }

    return { ...state, enabled, retry };
}
