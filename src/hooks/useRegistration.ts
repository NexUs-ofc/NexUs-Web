import { useCallback, useEffect, useRef, useState } from "react";
import { startRegistration } from "../services/auth.service";
import { ApiError } from "../services/apiError";
import {
    saveRegistrationId,
} from "../utils/registrationStorage";
import {
    isRegistrationFormValid,
    toRegistrationPayload,
    validateRegistrationForm,
} from "../utils/validateRegistration";
import type { RegistrationData } from "../types/registration";

export interface UseRegistrationResult {
    loading: boolean;
    error: string;
    success: boolean;
    registrationId: string | null;
    execute: (data: RegistrationData) => Promise<{ success: boolean; error: string | null }>;
    reset: () => void;
}

const INCOMPLETE_DRAFT_MESSAGE = "Preencha os dados do cadastro antes de contratar o plano.";

export function useRegistration(): UseRegistrationResult {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<boolean>(false);
    const [registrationId, setRegistrationId] = useState<string | null>(null);
    const mountedRef = useRef<boolean>(true);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            abortRef.current?.abort();
        };
    }, []);

    const reset = useCallback(() => {
        if (mountedRef.current) {
            setError("");
            setSuccess(false);
        }
    }, []);

    const execute = useCallback(
        async (data: RegistrationData): Promise<{ success: boolean; error: string | null }> => {
            const errors = validateRegistrationForm(data);
            if (!isRegistrationFormValid(errors)) {
                if (mountedRef.current) {
                    setError(INCOMPLETE_DRAFT_MESSAGE);
                    setSuccess(false);
                }
                return { success: false, error: INCOMPLETE_DRAFT_MESSAGE };
            }
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;
            if (mountedRef.current) {
                setLoading(true);
                setError("");
                setSuccess(false);
            }
            try {
                const payload = toRegistrationPayload(data);
                const response = await startRegistration(payload, { signal: controller.signal });
                if (!mountedRef.current) {
                    return { success: false, error: null };
                }
                saveRegistrationId(response.registrationId);
                setRegistrationId(response.registrationId);
                setLoading(false);
                setSuccess(true);
                return { success: true, error: null };
            } catch (requestError) {
                if (!mountedRef.current) {
                    return { success: false, error: null };
                }
                const message =
                    requestError instanceof ApiError
                        ? requestError.message
                        : "Erro ao iniciar o cadastro. Tente novamente.";
                setError(message);
                setLoading(false);
                setSuccess(false);
                return { success: false, error: message };
            }
        },
        [],
    );

    return { loading, error, success, registrationId, execute, reset };
}
