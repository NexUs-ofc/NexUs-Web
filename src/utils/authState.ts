import type { AuthStatus } from "../types/auth";
import type { Profile } from "../types/profile";

export interface AuthState {
    status: AuthStatus;
    profile: Profile | null;
    accessToken: string | null;
    expiresAt: string | null;
    refreshToken: string | null;
    refreshExpiresAt: string | null;
    error: string | null;
    notice: string;
}

export type AuthAction =
    | { type: "RESTORE_START" }
    | {
        type: "RESTORE_SUCCESS";
        profile: Profile | null;
        accessToken: string | null;
        expiresAt: string | null;
        refreshToken: string | null;
        refreshExpiresAt: string | null;
    }
    | {
        type: "LOGIN_SUCCESS";
        profile: Profile;
        accessToken: string;
        expiresAt: string | null;
        refreshToken: string | null;
        refreshExpiresAt: string | null;
    }
    | { type: "LOGIN_ERROR"; error: string }
    | { type: "PROFILE_UPDATED"; profile: Profile }
    | { type: "LOGOUT" }
    | { type: "CLEAR_ERROR" };

export const initialAuthState: AuthState = {
    status: "loading",
    profile: null,
    accessToken: null,
    expiresAt: null,
    refreshToken: null,
    refreshExpiresAt: null,
    error: null,
    notice: "",
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "RESTORE_START":
            return { ...state, status: "loading", error: null, notice: "" };
        case "RESTORE_SUCCESS":
            return {
                ...state,
                status: action.profile ? "authenticated" : "idle",
                profile: action.profile,
                accessToken: action.accessToken,
                expiresAt: action.expiresAt,
                refreshToken: action.refreshToken,
                refreshExpiresAt: action.refreshExpiresAt,
                error: null,
            };
        case "LOGIN_SUCCESS":
            return {
                ...state,
                status: "authenticated",
                notice: "Autenticação realizada com sucesso.",
                profile: action.profile,
                accessToken: action.accessToken,
                expiresAt: action.expiresAt,
                refreshToken: action.refreshToken,
                refreshExpiresAt: action.refreshExpiresAt,
                error: null,
            };
        case "LOGIN_ERROR":
            return { ...state, status: "error", error: action.error, notice: "" };
        case "PROFILE_UPDATED":
            return state.profile?.id === action.profile.id && state.status === "authenticated"
                ? { ...state, profile: action.profile }
                : state;
        case "LOGOUT":
            return {
                ...state,
                status: "idle",
                notice: "Sessão encerrada.",
                profile: null,
                accessToken: null,
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
        accessToken: string,
        expiresAt: string | null,
        refreshToken: string | null,
        refreshExpiresAt: string | null,
    ) => void;
    setLoginError: (error: string) => void;
    clearError: () => void;
    signOut: () => void;
    updateProfile: (profile: Profile) => void;
}
