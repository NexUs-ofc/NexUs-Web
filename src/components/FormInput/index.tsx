import { useId, useState } from "react";
import type { ChangeEvent, HTMLInputTypeAttribute } from "react";
import type GenericComponentProps from "../../types/common";
import { MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md";
import "./form-input.css";

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
    error?: string;
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
    error = "",
}: FormInputProps) {
    const generatedId = useId();
    const inputId = id ?? `${name}-${generatedId}`;
    const errorId = error !== "" ? `${inputId}-error` : undefined;
    const [showPassword, setShowPassword] = useState<boolean>(false);

    function handleTogglePassword(): void {
        setShowPassword((previousValue) => !previousValue);
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
                    onChange={onChange}
                    maxLength={maxLength}
                    autoComplete={autoComplete}
                    required={required}
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
                ) : null}
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
            ) : null}
        </div>
    );
}
