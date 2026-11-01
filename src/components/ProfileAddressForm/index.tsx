import { useEffect, useId, useRef } from "react";
import { FiChevronDown, FiMapPin } from "react-icons/fi";
import FormInput from "../FormInput";
import type { ProfileAddress } from "../../types/profile";
import type { CepLookupState } from "../../types/cep";
import { PROFILE_MAX_LENGTH } from "../../utils/validateProfile";
import { BRAZILIAN_STATES, maskStoreCep } from "../../utils/validateStore";

export interface ProfileAddressFormProps {
    address: ProfileAddress;
    errors: Record<keyof ProfileAddress, string>;
    cepLookup: CepLookupState;
    onRetryCep: () => void;
    onChange: (field: keyof ProfileAddress, value: string) => void;
}

export default function ProfileAddressForm({ address, errors, cepLookup, onRetryCep, onChange }: ProfileAddressFormProps) {
    const id = useId();
    const feedbackRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const active = document.activeElement;
        if ((cepLookup.loading || cepLookup.error || cepLookup.message) && active instanceof HTMLInputElement && active.name === "cep") {
            feedbackRef.current?.scrollIntoView({ block: "nearest" });
        }
    }, [cepLookup.loading, cepLookup.error, cepLookup.message]);
    function field(name: Exclude<keyof ProfileAddress, "state">, label: string, placeholder: string, autoComplete?: string) {
        return <FormInput name={name} label={label} placeholder={placeholder} value={address[name]} error={errors[name]} maxLength={PROFILE_MAX_LENGTH[name]} autoComplete={autoComplete} mask={name === "cep" ? maskStoreCep : undefined} onChange={(event) => onChange(name, event.currentTarget.value)} />;
    }
    return (
        <details className="profile-form__address">
            <summary>
                <FiMapPin aria-hidden="true" />
                <span><strong>Endereço da empresa</strong><span>Adicionar ou editar endereço</span></span>
                <FiChevronDown className="profile-form__chevron" aria-hidden="true" />
            </summary>
            <div className="profile-form__address-fields">
                {field("cep", "CEP", "00000-000", "postal-code")}
                <div ref={feedbackRef} className="profile-form__cep-feedback" role="status" aria-live="polite" aria-atomic="true">
                    {cepLookup.loading ? <p>Buscando endereço...</p> : null}
                    {cepLookup.message ? <p>{cepLookup.message}</p> : null}
                    {cepLookup.error ? <p className="formFieldError">{cepLookup.error}</p> : null}
                </div>
                {cepLookup.error ? <button type="button" className="profile-form__text-button" onClick={onRetryCep}>Tentar consultar CEP novamente</button> : null}
                {field("street", "Logradouro", "Rua ou avenida", "address-line1")}
                <div className="profile-form__address-row">
                    {field("number", "Número", "Número")}
                    {field("neighborhood", "Bairro", "Bairro", "address-line2")}
                </div>
                <div className="profile-form__address-row">
                    {field("city", "Cidade", "Cidade", "address-level2")}
                    <div className="formInputContainer">
                        <label className="formLabel" htmlFor={id}>Estado</label>
                        <select id={id} name="state" className="formInput" value={address.state} autoComplete="address-level1" onChange={(event) => onChange("state", event.currentTarget.value)} aria-invalid={Boolean(errors.state)} aria-describedby={errors.state ? `${id}-error` : undefined}>
                            <option value="">Selecione</option>
                            {BRAZILIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                        </select>
                        {errors.state ? <span className="formFieldError" id={`${id}-error`} role="alert">{errors.state}</span> : null}
                    </div>
                </div>
            </div>
        </details>
    );
}
