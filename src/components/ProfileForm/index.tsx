import { useEffect, useId } from "react";
import { FiLock, FiPhone, FiTrash2 } from "react-icons/fi";
import FormInput from "../FormInput";
import PrimaryButton from "../PrimaryButton";
import ErrorAlert from "../ErrorAlert";
import ProfilePhotoPicker from "../ProfilePhotoPicker";
import ProfileAddressForm from "../ProfileAddressForm";
import CompanyPlanBadge from "../CompanyPlanBadge";
import { useProfileForm } from "../../hooks/useProfileForm";
import { useProfilePhoto } from "../../hooks/useProfilePhoto";
import type { Profile, ProfileUpdateData } from "../../types/profile";
import type { Company } from "../../types/company";
import { maskProfilePhone, PROFILE_MAX_LENGTH } from "../../utils/validateProfile";
import "../../../styles/components/ProfileForm/profile-form.css";

export interface ProfileFormProps {
    profile: Profile;
    saving: boolean;
    error: string;
    company: Company | null;
    companyEnabled: boolean;
    companyLoading: boolean;
    companyError: string;
    onRetryCompany: () => void;
    onSave: (data: ProfileUpdateData) => Promise<boolean>;
    onSaved: () => void;
    onCancel: () => void;
}

export default function ProfileForm({ profile, saving, error, company, companyEnabled, companyLoading, companyError, onRetryCompany, onSave, onSaved, onCancel }: ProfileFormProps) {
    const id = useId();
    const photo = useProfilePhoto(profile.profileImageUrl ?? "");
    const { form, errors, phoneKeys, formRef, addressLookup, changeName, changePhone, addPhone, removePhone, changeAddress, submit } = useProfileForm({
        profile, onSaved,
        onSave: (data) => onSave({ ...data, photoFile: photo.file, profileImageUrl: photo.url }),
    });
    useEffect(() => {
        if (error) formRef.current?.querySelector<HTMLElement>(".errorAlert")?.scrollIntoView({ block: "nearest" });
    }, [error, formRef]);
    return (
        <form ref={formRef} className="profile-form" noValidate aria-busy={saving} onSubmit={(event) => { if (photo.loading || saving) { event.preventDefault(); return; } void submit(event); }}>
            <div className="profile-form__body">
                <fieldset className="profile-form__fields" disabled={saving}>
                    <legend className="profile-form__sr-only">Dados do perfil da empresa</legend>
                    <ProfilePhotoPicker value={photo.url} loading={photo.loading} disabled={saving} error={photo.error} onSelect={photo.select} onRemove={photo.remove}>
                        {companyEnabled && company?.planName ? <CompanyPlanBadge planName={company.planName} /> : null}
                    </ProfilePhotoPicker>
                    <FormInput name="name" label="Nome da empresa" placeholder="Nome da empresa" autoComplete="organization" value={form.name} error={errors.name} maxLength={PROFILE_MAX_LENGTH.name} required onChange={(event) => changeName(event.currentTarget.value)} />
                    <div className="profile-form__phones">
                        {form.phones.map((phone, index) => (
                            <div className="profile-form__phone" data-profile-phone key={phoneKeys[index]}>
                                <FiPhone className="profile-form__phone-icon" aria-hidden="true" />
                                <FormInput name={`phone-${index}`} label={index === 0 ? "Telefone de contato" : `Telefone de contato ${index + 1}`} placeholder="(11) 99999-9999" type="tel" maxLength={30} autoComplete="tel" value={phone} error={errors.phones[index]} mask={maskProfilePhone} onChange={(event) => changePhone(index, event.currentTarget.value)} />
                                {form.phones.length > 1 ? <button className="profile-form__remove-phone" type="button" aria-label={`Remover telefone ${index + 1}`} onClick={() => removePhone(index)}><FiTrash2 aria-hidden="true" /></button> : null}
                            </div>
                        ))}
                        <button type="button" className="profile-form__text-button" data-add-phone onClick={addPhone}>+ Adicionar telefone</button>
                    </div>
                    <section className="profile-form__account" aria-labelledby={`${id}-account`}>
                        <h3 id={`${id}-account`}>Dados da conta</h3>
                        <div className="formInputContainer">
                            <label className="formLabel" htmlFor={`${id}-email`}>E-mail da conta</label>
                            <div className="profile-form__locked">
                                <input className="formInput formNormalInput" id={`${id}-email`} type="email" value={profile.email} readOnly />
                                <FiLock aria-hidden="true" />
                            </div>
                        </div>
                        <div className="formInputContainer">
                            <label className="formLabel" htmlFor={`${id}-cnpj`}>CNPJ</label>
                            <div className="profile-form__locked">
                                <input className="formInput formNormalInput" id={`${id}-cnpj`} value={company?.cnpj ? formatCompanyCnpj(company.cnpj) : ""} placeholder={companyLoading ? "Carregando dados da empresa..." : companyError ? "Não foi possível carregar" : companyEnabled ? "Não informado" : "Não disponível"} readOnly aria-busy={companyLoading} aria-describedby={`${id}-cnpj-help`} />
                                <FiLock aria-hidden="true" />
                            </div>
                            <span id={`${id}-cnpj-help`} className="profile-form__sr-only">{companyLoading ? "Carregando CNPJ da empresa." : company?.cnpj ? "CNPJ consultado nos dados da empresa." : "CNPJ não disponível."}</span>
                            {companyLoading ? <p className="profile-form__company-status" role="status">Carregando dados da empresa...</p> : null}
                            {companyError ? <p className="profile-form__company-error" role="alert">{companyError} <button type="button" onClick={onRetryCompany}>Tentar novamente</button></p> : null}
                        </div>
                    </section>
                    <ProfileAddressForm address={form.address} errors={errors.address} addressLookup={addressLookup} onRetryCep={() => {
                        addressLookup.retry();
                        formRef.current?.querySelector<HTMLInputElement>('input[name="cep"]')?.focus();
                    }} onChange={changeAddress} />
                </fieldset>
                {error ? <ErrorAlert title="Não foi possível concluir" message={error} /> : null}
                {saving ? <p className="profile-form__status" role="status">Salvando alterações do perfil...</p> : null}
            </div>
            <footer className="profile-form__actions">
                <button className="profile-form__cancel" type="button" disabled={saving} onClick={onCancel}>Cancelar</button>
                <PrimaryButton type="submit" loading={saving} disabled={photo.loading || addressLookup.loading || Boolean(addressLookup.error)}>Salvar alterações</PrimaryButton>
            </footer>
        </form>
    );
}

function formatCompanyCnpj(value: string): string {
    const digits = value.replace(/\D/gu, "");
    return digits.length === 14
        ? digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/u, "$1.$2.$3/$4-$5")
        : value;
}
