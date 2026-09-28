import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import type { AuthContextValue } from "../contexts/AuthContext";

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth deve ser usado dentro de AuthProvider.");
    }
    return context;
}
