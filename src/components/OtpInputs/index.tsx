import { useId } from "react";
import type { UseOtpInputsResult } from "../../hooks/useOtpInputs";
import "../../../styles/components/OtpInputs/otp-inputs.css";

export interface OtpInputsProps {
    controls: UseOtpInputsResult;
    disabled: boolean;
}

export default function OtpInputs({ controls, disabled }: OtpInputsProps) {
    const id = useId();
    const { digits, submitted, inputRefs, handleDigitChange, handleKeyDown, handlePaste } = controls;
    return (
        <div className="otp-inputs" aria-busy={disabled} role="group" aria-label="Código de verificação de seis dígitos">
            {digits.map((digit, index) => {
                const inputId = `${id}-otp-${index}`;
                const invalid = submitted && !digit;
                return (
                    <div key={index} className="otp-input-wrapper">
                        <label htmlFor={inputId} className="otp-label">Dígito {index + 1}</label>
                        <input
                            id={inputId}
                            className="otp-input"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]"
                            maxLength={1}
                            autoComplete={index === 0 ? "one-time-code" : "off"}
                            value={digit}
                            onChange={handleDigitChange(index)}
                            onKeyDown={handleKeyDown(index)}
                            onPaste={handlePaste(index)}
                            ref={(element) => { inputRefs.current[index] = element; }}
                            aria-invalid={invalid}
                            aria-describedby={invalid ? `${inputId}-error` : undefined}
                            disabled={disabled}
                            aria-label={`Dígito ${index + 1} do código de verificação`}
                        />
                        {invalid ? <span id={`${inputId}-error`} className="otp-field-error" role="alert">Informe o dígito {index + 1}.</span> : null}
                    </div>
                );
            })}
        </div>
    );
}
