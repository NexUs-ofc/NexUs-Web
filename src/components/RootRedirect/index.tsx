import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoadingSpinner from "../LoadingSpinner";

export default function RootRedirect() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner message="Verificando autenticação..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // TODO(próxima PR): redirecionar autenticados para a página inicial real.
    return <Navigate to="/login" replace />;
}
