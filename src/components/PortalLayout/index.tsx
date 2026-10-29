import { useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import PortalHeader from "../PortalHeader";
import StoresProvider from "../../contexts/StoresContext";
import { useAuth } from "../../hooks/useAuth";
import "./portal-layout.css";

export default function PortalLayout() {
    const { state, signOut } = useAuth();
    const navigate = useNavigate();

    const handleSignOut = useCallback((): void => {
        signOut();
        navigate("/login", { replace: true });
    }, [navigate, signOut]);

    return (
        <div className="portal-layout">
            <Navbar onSignOut={handleSignOut} />
            <div className="portal-layout__content">
                <PortalHeader
                    companyName={state.profile?.name ?? ""}
                    email={state.profile?.email ?? ""}
                    profileImageUrl={state.profile?.profileImageUrl ?? ""}
                />
                {state.profile ? (
                    <StoresProvider key={state.profile.id} profileId={state.profile.id}>
                        <Outlet />
                    </StoresProvider>
                ) : null}
            </div>
        </div>
    );
}
