import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../LoadingSpinner";

export default function RootRedirect() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <main aria-label="Verificando autenticação"><LoadingSpinner message="Verificando autenticação..." /></main>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Navigate to="/dashboard" replace />;
}
