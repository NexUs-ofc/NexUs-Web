import { useEffect, useMemo, useReducer } from "react";
import { authReducer, initialAuthState } from "../utils/authState";
import type { AuthContextValue } from "../utils/authState";
import {
    maintainAuthSession, restoreAuthSession, setAuthSession, subscribeAuthSession, updateSessionProfile,
} from "../services/sessionManager";

export function useAuthSession(): AuthContextValue {
    const [state, dispatch] = useReducer(authReducer, initialAuthState);

    useEffect(() => {
        const sync: Parameters<typeof subscribeAuthSession>[0] = (session) => {
            dispatch({
                type: "RESTORE_SUCCESS",
                profile: session?.profile ?? null,
                accessToken: session?.accessToken ?? null,
                expiresAt: session?.expiresAt ?? null,
                refreshToken: session?.refreshToken ?? null,
                refreshExpiresAt: session?.refreshExpiresAt ?? null,
            });
        };
        const unsubscribe = subscribeAuthSession(sync);
        sync(restoreAuthSession());
        const stopMaintenance = maintainAuthSession();
        return () => {
            unsubscribe();
            stopMaintenance();
        };
    }, []);

    return useMemo<AuthContextValue>(() => ({
        state,
        isAuthenticated: state.status === "authenticated" && state.profile !== null,
        isLoading: state.status === "loading",
        setAuthenticated: (profile, accessToken, expiresAt, refreshToken, refreshExpiresAt) => {
            setAuthSession({ profile, accessToken, expiresAt, refreshToken, refreshExpiresAt });
            dispatch({ type: "LOGIN_SUCCESS", profile, accessToken, expiresAt, refreshToken, refreshExpiresAt });
        },
        setLoginError: (error) => { dispatch({ type: "LOGIN_ERROR", error }); },
        updateProfile: updateSessionProfile,
        clearError: () => { dispatch({ type: "CLEAR_ERROR" }); },
        signOut: () => {
            setAuthSession(null);
            dispatch({ type: "LOGOUT" });
        },
    }), [state]);
}
