import { useEffect, useState } from "react";
import { getCompanyDetails } from "../services/company.service";
import type { CompanyDetails } from "../types/company";
import type { Profile } from "../types/profile";

export function useCompanyDetails(profile: Profile) {
    const enabled = profile.profileType === "COMPANY";
    const [attempt, setAttempt] = useState(0);
    const [state, setState] = useState({
        company: null as CompanyDetails | null,
        loading: enabled,
        error: "",
    });

    useEffect(() => {
        if (!enabled) return;

        const controller = new AbortController();
        const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(15_000)]);

        void getCompanyDetails({ signal }).then((company) => {
            if (!signal.aborted) setState({ company, loading: false, error: "" });
        }).catch(() => {
            if (!controller.signal.aborted) setState({
                company: null,
                loading: false,
                error: "Não foi possível carregar os dados da empresa. Tente novamente.",
            });
        });

        return () => controller.abort();
    }, [attempt, enabled, profile.id]);

    function retry(): void {
        setState({ company: null, loading: true, error: "" });
        setAttempt((value) => value + 1);
    }

    return { ...state, enabled, retry };
}
