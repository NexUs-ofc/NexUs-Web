/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import type { AuthStatus } from "../../types/auth";
import type { Profile } from "../../types/profile";
import { clearAuthSession, isExpiredAt, loadAuthSession, saveAuthSession } from "../../utils/authStorage";
import { refreshSession } from "../../services/auth.service";
import { getProfile } from "../../services/profile.service";

export interface AuthState {
    status: AuthStatus;
    profile: Profile | null;
    expiresAt: string | null;
    refreshToken: string | null;
    refreshExpiresAt: string | null;
    error: string | null;
}

export type AuthAction =
    | { type: "RESTORE_START" }
    | {
        type: "RESTORE_SUCCESS";
        profile: Profile | null;
        expiresAt: string | null;
        refreshToken: string | null;
        refreshExpiresAt: string | null;
    }
    | {
        type: "LOGIN_SUCCESS";
        profile: Profile;
        expiresAt: string | null;
        refreshToken: string | null;
        refreshExpiresAt: string | null;
    }
    | { type: "LOGIN_ERROR"; error: string }
    | { type: "LOGOUT" }
    | { type: "CLEAR_ERROR" };

export const initialAuthState: AuthState = {
    status: "idle",
    profile: null,
    expiresAt: null,
    refreshToken: null,
    refreshExpiresAt: null,
    error: null,
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "RESTORE_START":
            return { ...state, status: "loading", error: null };
        case "RESTORE_SUCCESS":
            return {
                ...state,
                status: action.profile ? "authenticated" : "idle",
                profile: action.profile,
                expiresAt: action.expiresAt,
                refreshToken: action.refreshToken,
                refreshExpiresAt: action.refreshExpiresAt,
                error: null,
            };
        case "LOGIN_SUCCESS":
            return {
                ...state,
                status: "authenticated",
                profile: action.profile,
                expiresAt: action.expiresAt,
                refreshToken: action.refreshToken,
                refreshExpiresAt: action.refreshExpiresAt,
                error: null,
            };
        case "LOGIN_ERROR":
            return { ...state, status: "error", error: action.error };
        case "LOGOUT":
            return {
                ...state,
                status: "idle",
                profile: null,
                expiresAt: null,
                refreshToken: null,
                refreshExpiresAt: null,
                error: null,
            };
        case "CLEAR_ERROR":
            return { ...state, error: null, status: state.profile ? "authenticated" : "idle" };
        default:
            return state;
    }
}

export interface AuthContextValue {
    state: AuthState;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAuthenticated: (
        profile: Profile,
        expiresAt: string | null,
        refreshToken: string | null,
        refreshExpiresAt: string | null,
    ) => void;
    setLoginError: (error: string) => void;
    clearError: () => void;
    signOut: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
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
                        expiresAt: null,
                        refreshToken: null,
                        refreshExpiresAt: null,
                    });
                }
                return;
            }
            if (!isExpiredAt(stored.expiresAt)) {
                if (mounted) {
                    dispatch({
                        type: "RESTORE_SUCCESS",
                        profile: stored.profile,
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
                        expiresAt: null,
                        refreshToken: null,
                        refreshExpiresAt: null,
                    });
                }
                return;
            }
            try {
                const tokens = await refreshSession(
                    { refreshToken: stored.refreshToken },
                    { signal: controller.signal },
                );
                const profile = await getProfile({ signal: controller.signal });
                if (mounted) {
                    dispatch({
                        type: "LOGIN_SUCCESS",
                        profile,
                        expiresAt: tokens.accessTokenExpiresAt,
                        refreshToken: tokens.refreshToken,
                        refreshExpiresAt: tokens.refreshTokenExpiresAt,
                    });
                }
            } catch {
                clearAuthSession();
                if (mounted) {
                    dispatch({
                        type: "RESTORE_SUCCESS",
                        profile: null,
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
        if (state.status === "authenticated") {
            saveAuthSession({
                profile: state.profile,
                expiresAt: state.expiresAt,
                refreshToken: state.refreshToken,
                refreshExpiresAt: state.refreshExpiresAt,
            });
        }
    }, [state.status, state.profile, state.expiresAt, state.refreshToken, state.refreshExpiresAt]);

    const value = useMemo<AuthContextValue>(
        () => ({
            state,
            isAuthenticated: state.status === "authenticated" && state.profile !== null,
            isLoading: state.status === "loading",
            setAuthenticated: (
                profile: Profile,
                expiresAt: string | null,
                refreshToken: string | null,
                refreshExpiresAt: string | null,
            ) => {
                dispatch({ type: "LOGIN_SUCCESS", profile, expiresAt, refreshToken, refreshExpiresAt });
            },
            setLoginError: (error: string) => {
                dispatch({ type: "LOGIN_ERROR", error });
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

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
