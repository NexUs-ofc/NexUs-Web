import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import AuthProvider from "./contexts/AuthContext";
import LoadingSpinner from "./components/LoadingSpinner";
import PortalLayout from "./components/PortalLayout";
import PrivateRoute from "./components/PrivateRoute";
import RootRedirect from "./components/RootRedirect";
import "../styles/index.css";

const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const VerifyRegistrationPage = lazy(() => import("./pages/VerifyRegistrationPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const PlansPage = lazy(() => import("./pages/PlansPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const StoresPage = lazy(() => import("./pages/StoresPage"));
const CreateStorePage = lazy(() => import("./pages/CreateStorePage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const UpdatePlansPage = lazy(() => import("./pages/UpdatePlansPage"));

function App() {
    return (
        <AuthProvider>
            <Suspense fallback={<main aria-label="Carregando página"><LoadingSpinner message="Carregando página..." /></main>}>
                <Routes>
                    <Route path="/" element={<RootRedirect />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/cadastro" element={<RegisterPage />} />
                    <Route path="/cadastro/verificacao" element={<VerifyRegistrationPage />} />
                    <Route path="/planos" element={<PlansPage />} />
                    <Route element={<PrivateRoute><PortalLayout /></PrivateRoute>}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/dashboard/planos" element={<UpdatePlansPage />} />
                        <Route path="/lojas" element={<StoresPage />} />
                        <Route path="/lojas/nova" element={<CreateStorePage />} />
                        <Route path="/relatorios" element={<ReportsPage />} />
                    </Route>
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </AuthProvider>
    );
}

export default App;
