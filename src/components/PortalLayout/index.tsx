import { useCallback, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import PortalHeader from "../PortalHeader";
import ProfileModal from "../ProfileModal";
import StoresProvider from "../../contexts/StoresContext";
import { useAuth } from "../../hooks/useAuth";
import "../../../styles/components/PortalLayout/portal-layout.css";

export default function PortalLayout() {
    const { state, signOut } = useAuth();
    const navigate = useNavigate();
    const [profileOpen, setProfileOpen] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState("");

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
                    profileOpen={profileOpen}
                    onOpenProfile={() => { setProfileSuccess(""); setProfileOpen(true); }}
                />
                {profileSuccess ? <p className="portal-layout__profile-status" role="status">{profileSuccess}</p> : null}
                {state.profile ? (
                    <StoresProvider key={state.profile.id}>
                        <Outlet />
                    </StoresProvider>
                ) : null}
            </div>
            {profileOpen && state.profile ? <ProfileModal key={state.profile.id} profile={state.profile} onClose={() => setProfileOpen(false)} onSaved={() => { setProfileOpen(false); setProfileSuccess("Perfil atualizado com sucesso."); }} /> : null}
        </div>
    );
}
