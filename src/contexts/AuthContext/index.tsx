/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import type { AuthStatus } from "../../types/auth";
import type { Profile } from "../../types/profile";
import { clearAuthSession, loadAuthSession, saveAuthSession } from "../../utils/authStorage";

export interface AuthState {
    status: AuthStatus;
    profile: Profile | null;
    expiresAt: string | null;
    error: string | null;
}

export type AuthAction =
    | { type: "RESTORE_START" }
    | { type: "RESTORE_SUCCESS"; profile: Profile | null; expiresAt: string | null }
    | { type: "LOGIN_SUCCESS"; profile: Profile; expiresAt: string | null }
    | { type: "LOGIN_ERROR"; error: string }
    | { type: "LOGOUT" }
    | { type: "CLEAR_ERROR" };

export const initialAuthState: AuthState = {
    status: "idle",
    profile: null,
    expiresAt: null,
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
                error: null,
            };
        case "LOGIN_SUCCESS":
            return {
                ...state,
                status: "authenticated",
                profile: action.profile,
                expiresAt: action.expiresAt,
                error: null,
            };
        case "LOGIN_ERROR":
            return { ...state, status: "error", error: action.error };
        case "LOGOUT":
            return { ...state, status: "idle", profile: null, expiresAt: null, error: null };
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
    setAuthenticated: (profile: Profile, expiresAt: string | null) => void;
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
        dispatch({ type: "RESTORE_START" });
        const stored = loadAuthSession();
        dispatch({
            type: "RESTORE_SUCCESS",
            profile: stored?.profile ?? null,
            expiresAt: stored?.expiresAt ?? null,
        });
    }, []);

    useEffect(() => {
        if (state.status === "authenticated") {
            saveAuthSession(state.profile, state.expiresAt);
        }
    }, [state.status, state.profile, state.expiresAt]);

    const value = useMemo<AuthContextValue>(
        () => ({
            state,
            isAuthenticated: state.status === "authenticated" && state.profile !== null,
            isLoading: state.status === "loading",
            setAuthenticated: (profile: Profile, expiresAt: string | null) => {
                dispatch({ type: "LOGIN_SUCCESS", profile, expiresAt });
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
