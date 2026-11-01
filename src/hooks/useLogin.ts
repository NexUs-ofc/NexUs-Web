import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./useAuth";
import { login as loginRequest } from "../services/auth.service";
import { setCoreAuthToken } from "../services/coreClient";
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
    const [state, setState] = useState({ loading: false, error: "", success: false });
    const { loading, error, success } = state;
    const { setAuthenticated, setLoginError } = useAuth();

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
            setState((previous) => ({ ...previous, error: "", success: false }));
        }
    }, []);

    const execute = useCallback(
        async (data: LoginFormData): Promise<boolean> => {
            const errors = validateLoginForm(data);
            if (!isLoginFormValid(errors)) {
                const firstError = errors.email !== "" ? errors.email : errors.password;
                if (mountedRef.current) {
                    setState((previous) => ({ ...previous, error: firstError, success: false }));
                }
                setLoginError(firstError);
                return false;
            }
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;
            if (mountedRef.current) {
                setState((previous) => ({ ...previous, loading: true, error: "", success: false }));
            }
            try {
                const payload = toLoginPayload(data);
                const tokens = await loginRequest(payload, { signal: controller.signal });
                setCoreAuthToken(tokens.accessToken);
                const profile = await getProfile({ signal: controller.signal });
                if (!mountedRef.current || controller.signal.aborted) {
                    return false;
                }
                setAuthenticated(
                    profile,
                    tokens.accessToken,
                    tokens.accessTokenExpiresAt,
                    tokens.refreshToken,
                    tokens.refreshTokenExpiresAt,
                );
                setState((previous) => ({ ...previous, loading: false, success: true }));
                return true;
            } catch (requestError) {
                if (!mountedRef.current || controller.signal.aborted) {
                    return false;
                }
                const message =
                    requestError instanceof ApiError
                        ? requestError.message
                        : "Erro ao fazer login. Tente novamente.";
                setState((previous) => ({ ...previous, error: message }));
                setLoginError(message);
                setState((previous) => ({ ...previous, loading: false, success: false }));
                return false;
            }
        },
        [setAuthenticated, setLoginError],
    );

    return { loading, error, success, execute, reset };
}
