import { useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import { useAuth } from "../../hooks/useAuth";
import "./portal-layout.css";

export default function PortalLayout() {
    const { signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = useCallback((): void => {
        signOut();
        navigate("/login", { replace: true });
    }, [navigate, signOut]);

    return (
        <div className="portal-layout">
            <Navbar onSignOut={handleSignOut} />
            <Outlet />
        </div>
    );
}
