import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import AuthProvider from "./contexts/AuthContext";
import LoadingSpinner from "./components/LoadingSpinner";
import "./index.css";

const LoginPage = lazy(() => import("./pages/LoginPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function App() {
    return (
        <AuthProvider>
            <Suspense fallback={<LoadingSpinner message="Carregando página..." />}>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </Suspense>
        </AuthProvider>
    );
}

export default App;
