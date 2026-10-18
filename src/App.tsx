import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import AuthProvider from "./contexts/AuthContext";
import LoadingSpinner from "./components/LoadingSpinner";
import RootRedirect from "./components/RootRedirect";
import "./index.css";
import RegisterPage from "./pages/RegisterPage";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const PlansPage = lazy(() => import("./pages/PlansPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function App() {
    return (
        <AuthProvider>
            <Suspense fallback={<LoadingSpinner message="Carregando página..." />}>
                <Routes>
                    <Route path="/" element={<RootRedirect />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/cadastro" element={<RegisterPage />} />
                    <Route path="/planos" element={<PlansPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </AuthProvider>
    );
}

export default App;
