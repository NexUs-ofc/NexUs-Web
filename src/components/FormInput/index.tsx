import { useId, useState } from "react";
import type { ChangeEvent, HTMLInputTypeAttribute } from "react";
import type GenericComponentProps from "../../types/common";
import { MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md";
import "../../../styles/components/FormInput/form-input.css";

function getMaskedCaretPosition(value: string, masked: string, position: number): number {
    if (position === value.length) return masked.length;
    const digits = value.slice(0, position).replace(/\D/gu, "").length;
    if (!digits) {
        const firstDigit = masked.search(/\d/u);
        return Math.min(position, firstDigit < 0 ? masked.length : firstDigit);
    }
    let seen = 0;
    for (let index = 0; index < masked.length; index += 1) {
        if (/\d/u.test(masked[index])) seen += 1;
        if (seen === digits) return index + 1;
    }
    return masked.length;
}

export interface FormInputProps extends GenericComponentProps {
    label: string;
    name: string;
    placeholder: string;
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    type?: HTMLInputTypeAttribute;
    width?: string;
    maxLength?: number;
    autoComplete?: string;
    required?: boolean;
    disabled?: boolean;
    error?: string;
    mask?: (value: string) => string;
    reserveErrorSpace?: boolean;
}

export default function FormInput({
    className = "",
    id,
    label,
    name,
    placeholder,
    value,
    onChange,
    type = "text",
    width = "100%",
    maxLength,
    autoComplete,
    required = false,
    disabled = false,
    error = "",
    mask,
    reserveErrorSpace = false,
}: FormInputProps) {
    const generatedId = useId();
    const inputId = id ?? `${name}-${generatedId}`;
    const errorId = error !== "" ? `${inputId}-error` : undefined;
    const [showPassword, setShowPassword] = useState<boolean>(false);

    function handleTogglePassword(): void {
        setShowPassword((previousValue) => !previousValue);
    }

    function handleChange(event: ChangeEvent<HTMLInputElement>): void {
        if (mask === undefined) {
            onChange(event);
            return;
        }
        const input = event.currentTarget;
        const value = input.value;
        const start = input.selectionStart;
        const end = input.selectionEnd;
        const masked = mask(value);
        input.value = masked;
        if (start !== null && end !== null) {
            input.setSelectionRange(getMaskedCaretPosition(value, masked, start), getMaskedCaretPosition(value, masked, end));
        }
        onChange(event);
    }

    function renderInput(isPassword: boolean) {
        return (
            <>
                <input
                    className={isPassword ? "formInput formNormalInput formPasswordInput" : "formNormalInput formInput"}
                    id={inputId}
                    name={name}
                    type={isPassword ? (showPassword ? "text" : "password") : type}
                    placeholder={placeholder}
                    value={value}
                    onChange={handleChange}
                    maxLength={maxLength}
                    autoComplete={autoComplete}
                    required={required}
                    disabled={disabled}
                    aria-invalid={error !== ""}
                    aria-describedby={errorId}
                />
                {isPassword ? (
                    <button
                        type="button"
                        className="passwordToggle"
                        onClick={handleTogglePassword}
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        aria-pressed={showPassword}
                    >
                        {showPassword ? (
                            <MdOutlineVisibility className="icon passwordIcon" aria-hidden="true" />
                        ) : (
                            <MdOutlineVisibilityOff className="icon passwordIcon" aria-hidden="true" />
                        )}
                    </button>
                ) : null}
            </>
        );
    }

    if (type === "password") {
        return (
            <div className={`formInputContainer ${className}`} style={{ width }}>
                <label className="formLabel" htmlFor={inputId}>
                    {label}
                </label>
                <div className="formPasswordInputContainer">
                    {renderInput(true)}
                </div>
                {error !== "" ? (
                    <span className="formFieldError" id={errorId} role="alert">
                        {error}
                    </span>
                ) : reserveErrorSpace ? <span className="formFieldError formFieldErrorPlaceholder" aria-hidden="true" /> : null}
            </div>
        );
    }

    return (
        <div className={`formInputContainer ${className}`} style={{ width }}>
            <label className="formLabel" htmlFor={inputId}>
                {label}
            </label>
            {renderInput(false)}
            {error !== "" ? (
                <span className="formFieldError" id={errorId} role="alert">
                    {error}
                </span>
            ) : reserveErrorSpace ? <span className="formFieldError formFieldErrorPlaceholder" aria-hidden="true" /> : null}
        </div>
    );
}
