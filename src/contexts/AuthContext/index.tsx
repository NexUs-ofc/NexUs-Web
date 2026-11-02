/* eslint-disable react-refresh/only-export-components */
import { createContext } from "react";
import type { ReactNode } from "react";
import type { AuthContextValue } from "../../utils/authState";
import { useAuthSession } from "../../hooks/useAuthSession";

export const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps { children: ReactNode; }

export default function AuthProvider({ children }: AuthProviderProps) {
    const value = useAuthSession();
    return <AuthContext.Provider value={value}><p className="sr-only" role="status" aria-live="polite">{value.state.notice}</p>{children}</AuthContext.Provider>;
}
