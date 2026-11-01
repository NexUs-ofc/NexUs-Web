import { useState } from "react";
import type GenericComponentProps from "../../types/common";
import "../../../styles/components/PortalHeader/portal-header.css";

export interface PortalHeaderProps extends GenericComponentProps {
    companyName: string;
    email: string;
    profileImageUrl: string;
    profileOpen: boolean;
    onOpenProfile: () => void;
}

export default function PortalHeader({
    companyName,
    email,
    profileImageUrl,
    profileOpen,
    onOpenProfile,
    className = "",
    id,
}: PortalHeaderProps) {
    const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
    const initials = companyName.trim().split(/\s+/u).slice(0, 2).map((part) => part.charAt(0)).join("").toLocaleUpperCase("pt-BR");

    return (
        <header className={`portal-header ${className}`} id={id}>
            <p className="portal-header__title">Painel de Controle</p>
            <button type="button" id="portal-profile-trigger" className="portal-header__profile" aria-label={`Abrir perfil da empresa ${companyName}`} aria-haspopup="dialog" aria-expanded={profileOpen} onClick={onOpenProfile}>
                <span className="portal-header__identity">
                    <span className="portal-header__name">{companyName}</span>
                    <span className="portal-header__email">{email}</span>
                </span>
                <span className="portal-header__avatar" aria-hidden="true">
                    {profileImageUrl && profileImageUrl !== failedImageUrl ? (
                        <img src={profileImageUrl} alt="" onError={() => setFailedImageUrl(profileImageUrl)} />
                    ) : initials}
                </span>
            </button>
        </header>
    );
}
