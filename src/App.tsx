import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import AuthProvider from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import LoadingSpinner from "./components/LoadingSpinner";
import "./index.css";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function App() {
    return (
        <AuthProvider>
            <Suspense fallback={<LoadingSpinner message="Carregando página..." />}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <DashboardPage />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/perfil/:userId"
                        element={
                            <PrivateRoute>
                                <ProfilePage />
                            </PrivateRoute>
                        }
                    />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </AuthProvider>
    );
}

export default App;
