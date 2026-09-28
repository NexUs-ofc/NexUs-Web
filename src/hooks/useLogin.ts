import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import { login as loginRequest } from "../services/auth.service";
import { getProfile } from "../services/profile.service";
import { ApiError } from "../services/apiError";
import {
    isLoginFormValid,
    toLoginPayload,
    validateLoginForm,
} from "../utils/validateLogin";
import type { LoginFormData } from "../utils/validateLogin";

export interface UseLoginResult {
    loading: boolean;
    error: string;
    success: boolean;
    execute: (data: LoginFormData) => Promise<boolean>;
    reset: () => void;
}

export function useLogin(): UseLoginResult {
    const { setAuthenticated, setLoginError } = useAuth();
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
        async (data: LoginFormData): Promise<boolean> => {
            const errors = validateLoginForm(data);
            if (!isLoginFormValid(errors)) {
                const firstError = errors.email !== "" ? errors.email : errors.password;
                if (mountedRef.current) {
                    setError(firstError);
                    setSuccess(false);
                }
                setLoginError(firstError);
                return false;
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
                const payload = toLoginPayload(data);
                const tokens = await loginRequest(payload, { signal: controller.signal });
                const profile = await getProfile({ signal: controller.signal });
                if (!mountedRef.current) {
                    return false;
                }
                setAuthenticated(
                    profile,
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
                        : "Erro ao fazer login. Tente novamente.";
                setError(message);
                setLoginError(message);
                setLoading(false);
                setSuccess(false);
                return false;
            }
        },
        [setAuthenticated, setLoginError],
    );

    return { loading, error, success, execute, reset };
}
