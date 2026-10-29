import { useId } from "react";
import type GenericComponentProps from "../../types/common";
import { BRAZILIAN_STATES } from "../../utils/validateStore";

export interface StoreStateSelectProps extends GenericComponentProps {
    value: string;
    error: string;
    mode: "create" | "edit";
    onChange: (value: string) => void;
}

export default function StoreStateSelect({ value, error, mode, onChange }: StoreStateSelectProps) {
    const id = useId();
    return (
        <div className="formInputContainer store-form__state">
            <label className="formLabel" htmlFor={id}>Estado</label>
            <div className="store-form__select">
                <select id={id} name="state" value={value} onChange={(event) => onChange(event.currentTarget.value)} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}>
                    <option value="">{mode === "create" ? "Selecione o Estado" : "Selecione"}</option>
                    {BRAZILIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
                </select>
                <img src={`${import.meta.env.BASE_URL}stores/${mode === "edit" ? "chevron-up.svg" : "chevron-down.svg"}`} alt="" />
            </div>
            {error ? <span className="formFieldError" id={`${id}-error`} role="alert">{error}</span> : null}
        </div>
    );
}
