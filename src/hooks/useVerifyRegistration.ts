import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import { verifyRegistration as verifyRegistrationRequest } from "../services/auth.service";
import { setCoreAuthToken } from "../services/coreClient";
import { getProfile } from "../services/profile.service";
import { ApiError } from "../services/apiError";
import { clearRegistrationId } from "../utils/registrationStorage";
import type { VerifyRegistrationPayload } from "../types/auth";

export interface UseVerifyRegistrationResult {
    loading: boolean;
    error: string;
    success: boolean;
    execute: (payload: VerifyRegistrationPayload) => Promise<boolean>;
    reset: () => void;
}

export function useVerifyRegistration(): UseVerifyRegistrationResult {
    const { setAuthenticated } = useAuth();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<boolean>(false);
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
        async (payload: VerifyRegistrationPayload): Promise<boolean> => {
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;
            if (mountedRef.current) {
                setLoading(true);
                setError("");
                setSuccess(false);
            }
            try {
                const tokens = await verifyRegistrationRequest(payload, {
                    signal: controller.signal,
                });
                setCoreAuthToken(tokens.accessToken);
                const profile = await getProfile({ signal: controller.signal });
                if (!mountedRef.current) {
                    return false;
                }
                clearRegistrationId();
                setAuthenticated(
                    profile,
                    tokens.accessToken,
                    tokens.accessTokenExpiresAt,
                    tokens.refreshToken,
                    tokens.refreshTokenExpiresAt,
                );
                setLoading(false);
                setSuccess(true);
                return true;
            } catch (requestError) {
                if (!mountedRef.current) {
                    return false;
                }
                const message =
                    requestError instanceof ApiError
                        ? requestError.message
                        : "Erro ao verificar o cadastro. Tente novamente.";
                setError(message);
                setLoading(false);
                setSuccess(false);
                return false;
            }
        },
        [setAuthenticated],
    );

    return { loading, error, success, execute, reset };
}
