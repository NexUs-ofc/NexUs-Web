import FormInput from "../FormInput";
import PrimaryButton from "../PrimaryButton";
import ErrorAlert from "../ErrorAlert";
import StorePhotoPicker from "../StorePhotoPicker";
import StoreStateSelect from "../StoreStateSelect";
import { useStoreForm } from "../../hooks/useStoreForm";
import { useStorePhoto } from "../../hooks/useStorePhoto";
import type { StoreFormData, StoreFormMode } from "../../types/store";
import type GenericComponentProps from "../../types/common";
import { STORE_MAX_LENGTH, maskStoreCep, maskStorePhone, maskStoreTime } from "../../utils/validateStore";
import { maskCnpj } from "../../utils/masks";
import "../../../styles/components/StoreForm/store-form.css";

export interface StoreFormProps extends GenericComponentProps {
    mode: StoreFormMode;
    initialData: StoreFormData;
    saving: boolean;
    error: string;
    onSave: (data: StoreFormData) => Promise<boolean>;
    onSaved: () => void;
    onCancel: () => void;
}

export default function StoreForm({ mode, initialData, saving, error, onSave, onSaved, onCancel, className = "" }: StoreFormProps) {
    const { form, errors, formRef, addressLookup, changeField, submit } = useStoreForm({ initialData, mode, onSave, onSaved });
    const photo = useStorePhoto((value) => changeField("photoDataUrl", value));
    const isCreate = mode === "create";
    const addressLocked = addressLookup.loading || addressLookup.address !== null;

    function field(name: keyof StoreFormData, label: string, placeholder: string, type: "text" | "email" | "tel" = "text", mask?: (value: string) => string) {
        const required = name === "name" || name === "cnpj" || name === "street" || isCreate && name === "email";
        const disabled = addressLocked && ["street", "neighborhood", "city", "state"].includes(name);
        return <FormInput name={name} label={`${label}${required ? " *" : ""}`} placeholder={placeholder} type={type} value={form[name]} error={name === "cep" ? addressLookup.error || errors.cep : errors[name]} onChange={(event) => changeField(name, event.currentTarget.value)} maxLength={STORE_MAX_LENGTH[name]} required={required} disabled={disabled} mask={mask} />;
    }

    const photoPicker = <StorePhotoPicker value={form.photoDataUrl} loading={photo.loading} disabled={saving} error={photo.error || errors.photoDataUrl} onSelect={photo.select} onRemove={photo.clear} />;
    const stateSelect = <StoreStateSelect mode={mode} value={form.state} error={errors.state} disabled={addressLocked} onChange={(value) => changeField("state", value)} />;
    const addressFeedback = <div className="store-form__address-feedback">
        <p className="store-form__status" role="status" aria-live="polite">
            {addressLookup.loading ? "Buscando endereço pelo CEP..." : addressLookup.address
                ? "Endereço preenchido pelo CEP. Para alterá-lo, informe outro CEP. Preencha o número da filial."
                : "Digite o CEP para preencher o endereço automaticamente."}
        </p>
        {addressLookup.error ? <button type="button" onClick={() => {
            addressLookup.retry();
            formRef.current?.querySelector<HTMLInputElement>('input[name="cep"]')?.focus();
        }}>Consultar CEP novamente</button> : null}
    </div>;

    return (
        <form ref={formRef} className={`store-form store-form--${mode} ${className}`} noValidate aria-busy={saving || addressLookup.loading} onSubmit={(event) => { if (photo.loading || saving) { event.preventDefault(); return; } void submit(event); }}>
            <fieldset className="store-form__fields" disabled={saving}>
                <legend className="store-form__sr-only">{isCreate ? "Dados da nova filial" : "Dados da loja"}</legend>
                {isCreate ? (
                    <>
                        <section className="store-form__section" aria-labelledby="store-identification">
                            <h2 id="store-identification">1. Identificação da Loja</h2>
                            <div className="store-form__divider" aria-hidden="true" />
                            {photoPicker}
                            <div className="store-form__grid store-form__grid--two">
                                {field("name", "Nome da filial", "Ex: São Paulo Paulista")}
                                {field("cnpj", "CNPJ", "00.000.000/0001-00", "text", maskCnpj)}
                            </div>
                        </section>
                        <section className="store-form__section" aria-labelledby="store-address">
                            <h2 id="store-address">2. Endereço e Localização</h2>
                            <div className="store-form__grid">
                                {field("cep", "CEP", "00000-000", "text", maskStoreCep)}
                                {field("city", "Cidade", "Digite a cidade")}
                                {stateSelect}
                            </div>
                            {addressFeedback}
                            <div className="store-form__divider" aria-hidden="true" />
                            {field("street", "Rua", "Av. Lins de Vasconcelos")}
                            <div className="store-form__grid store-form__grid--two">
                                {field("number", "Número", "1200")}
                                {field("neighborhood", "Bairro", "Vila Mariana")}
                            </div>
                        </section>
                        <section className="store-form__section" aria-labelledby="store-contact">
                            <h2 id="store-contact">3. Contato e Horário</h2>
                            <div className="store-form__divider" aria-hidden="true" />
                            <div className="store-form__grid">
                                {field("phone", "Telefone", "(11) 99999-9999", "tel", maskStorePhone)}
                                {field("email", "E-mail", "filial@empresa.com.br", "email")}
                            </div>
                            <div className="store-form__grid store-form__grid--two">
                                {field("openingTime", "Abertura", "08:00", "text", maskStoreTime)}
                                {field("closingTime", "Fechamento", "18:30", "text", maskStoreTime)}
                            </div>
                        </section>
                    </>
                ) : (
                    <div className="store-form__edit-fields">
                        <p className="store-form__status">CNPJ: {form.cnpj}</p>
                        {photoPicker}
                        {field("name", "Nome da loja", "Ex: Loja Vila Mariana")}
                        <div className="store-form__grid store-form__grid--two">
                            {field("cep", "CEP", "00000-000", "text", maskStoreCep)}
                            {field("phone", "Telefone", "(11) 99999-9999", "tel", maskStorePhone)}
                        </div>
                        {addressFeedback}
                        {field("street", "Rua", "Av. Lins de Vasconcelos")}
                        <div className="store-form__grid store-form__grid--two">
                            {field("number", "Número", "1200")}
                            {field("neighborhood", "Bairro", "Vila Mariana")}
                        </div>
                        <div className="store-form__grid store-form__grid--city">
                            {field("city", "Cidade", "Digite a cidade")}
                            {stateSelect}
                        </div>
                        <div className="store-form__grid store-form__grid--two">
                            {field("openingTime", "Abertura", "08:00", "text", maskStoreTime)}
                            {field("closingTime", "Fechamento", "18:30", "text", maskStoreTime)}
                        </div>
                    </div>
                )}
            </fieldset>
            {error ? <ErrorAlert title="Não foi possível salvar" message={error} /> : null}
            {saving ? <p className="store-form__status" role="status">Salvando {isCreate ? "filial" : "loja"}...</p> : null}
            <footer className="store-form__actions">
                <button className="store-form__cancel" type="button" disabled={saving} onClick={onCancel}>Cancelar</button>
                <PrimaryButton type="submit" loading={saving} disabled={photo.loading || addressLookup.loading || Boolean(addressLookup.error)}>{isCreate ? "Salvar Filial" : "Salvar Loja"}</PrimaryButton>
            </footer>
        </form>
    );
}
