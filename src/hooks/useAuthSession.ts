import { validateRefresh } from "../utils/validateAuth";
import { useEffect, useMemo, useReducer } from "react";
import type { Profile } from "../types/profile";
import { clearAuthSession, isExpiredAt, loadAuthSession, saveAuthSession } from "../utils/authStorage";
import { authReducer, initialAuthState } from "../utils/authState";
import type { AuthContextValue } from "../utils/authState";
import { refreshSession } from "../services/auth.service";
import { getProfile } from "../services/profile.service";
import { setCoreAuthToken } from "../services/coreClient";

export function useAuthSession(): AuthContextValue {
    const [state, dispatch] = useReducer(authReducer, initialAuthState);

    useEffect(() => {
        const controller = new AbortController();
        let mounted = true;

        async function restore(): Promise<void> {
            dispatch({ type: "RESTORE_START" });
            const stored = loadAuthSession();
            if (stored === null || stored.profile === null) {
                if (mounted) {
                    dispatch({
                        type: "RESTORE_SUCCESS",
                        profile: null,
                        accessToken: null,
                        expiresAt: null,
                        refreshToken: null,
                        refreshExpiresAt: null,
                    });
                }
                return;
            }
            if (!isExpiredAt(stored.expiresAt) && stored.accessToken !== null) {
                if (mounted) {
                    dispatch({
                        type: "RESTORE_SUCCESS",
                        profile: stored.profile,
                        accessToken: stored.accessToken,
                        expiresAt: stored.expiresAt,
                        refreshToken: stored.refreshToken,
                        refreshExpiresAt: stored.refreshExpiresAt,
                    });
                }
                return;
            }
            if (stored.refreshToken === null) {
                clearAuthSession();
                if (mounted) {
                    dispatch({
                        type: "RESTORE_SUCCESS",
                        profile: null,
                        accessToken: null,
                        expiresAt: null,
                        refreshToken: null,
                        refreshExpiresAt: null,
                    });
                }
                return;
            }
            try {
                const tokens = await refreshSession(
                    validateRefresh({ refreshToken: stored.refreshToken }),
                    { signal: controller.signal },
                );
                setCoreAuthToken(tokens.accessToken);
                const profile = await getProfile({ signal: controller.signal });
                if (mounted) {
                    dispatch({
                        type: "LOGIN_SUCCESS",
                        profile,
                        accessToken: tokens.accessToken,
                        expiresAt: tokens.accessTokenExpiresAt,
                        refreshToken: tokens.refreshToken,
                        refreshExpiresAt: tokens.refreshTokenExpiresAt,
                    });
                }
            } catch {
                if (controller.signal.aborted) return;
                clearAuthSession();
                if (mounted) {
                    dispatch({
                        type: "RESTORE_SUCCESS",
                        profile: null,
                        accessToken: null,
                        expiresAt: null,
                        refreshToken: null,
                        refreshExpiresAt: null,
                    });
                }
            }
        }

        void restore();
        return () => {
            mounted = false;
            controller.abort();
        };
    }, []);

    useEffect(() => {
        setCoreAuthToken(state.accessToken);
    }, [state.accessToken]);

    useEffect(() => {
        if (state.status === "authenticated") {
            saveAuthSession({
                profile: state.profile,
                accessToken: state.accessToken,
                expiresAt: state.expiresAt,
                refreshToken: state.refreshToken,
                refreshExpiresAt: state.refreshExpiresAt,
            });
        }
    }, [state.status, state.profile, state.accessToken, state.expiresAt, state.refreshToken, state.refreshExpiresAt]);

    const value = useMemo<AuthContextValue>(
        () => ({
            state,
            isAuthenticated: state.status === "authenticated" && state.profile !== null,
            isLoading: state.status === "loading",
            setAuthenticated: (
                profile: Profile,
                accessToken: string,
                expiresAt: string | null,
                refreshToken: string | null,
                refreshExpiresAt: string | null,
            ) => {
                dispatch({
                    type: "LOGIN_SUCCESS",
                    profile,
                    accessToken,
                    expiresAt,
                    refreshToken,
                    refreshExpiresAt,
                });
            },
            setLoginError: (error: string) => {
                dispatch({ type: "LOGIN_ERROR", error });
            },
            updateProfile: (profile: Profile) => {
                dispatch({ type: "PROFILE_UPDATED", profile });
            },
            clearError: () => {
                dispatch({ type: "CLEAR_ERROR" });
            },
            signOut: () => {
                clearAuthSession();
                dispatch({ type: "LOGOUT" });
            },
        }),
        [state],
    );

    return value;
}
