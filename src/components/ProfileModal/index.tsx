import { useId } from "react";
import { FiX } from "react-icons/fi";
import ProfileForm from "../ProfileForm";
import { useDialog } from "../../hooks/useDialog";
import { useProfileEditor } from "../../hooks/useProfileEditor";
import { useCompanyDetails } from "../../hooks/useCompanyDetails";
import type { Profile } from "../../types/profile";
import "../../../styles/components/ProfileModal/profile-modal.css";

export interface ProfileModalProps {
    profile: Profile;
    onClose: () => void;
    onSaved: () => void;
}

export default function ProfileModal({ profile, onClose, onSaved }: ProfileModalProps) {
    const id = useId();
    const dialogRef = useDialog("portal-profile-trigger");
    const { saving, error, save } = useProfileEditor(profile);
    const companyDetails = useCompanyDetails(profile);
    return (
        <dialog ref={dialogRef} className="profile-modal" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} aria-modal="true" aria-busy={saving} onCancel={(event) => { event.preventDefault(); if (!saving) onClose(); }}>
            <header className="profile-modal__header">
                <div>
                    <h2 id={`${id}-title`}>Perfil da empresa</h2>
                    <p id={`${id}-description`}>Atualize os dados da sua empresa.</p>
                </div>
                <button type="button" className="profile-modal__close" aria-label="Fechar perfil da empresa" disabled={saving} data-initial-focus onClick={onClose}><FiX aria-hidden="true" /></button>
            </header>
            <ProfileForm profile={profile} saving={saving} error={error} company={companyDetails.company} companyEnabled={companyDetails.enabled} companyLoading={companyDetails.loading} companyError={companyDetails.error} onRetryCompany={companyDetails.retry} onSave={save} onSaved={onSaved} onCancel={onClose} />
        </dialog>
    );
}
