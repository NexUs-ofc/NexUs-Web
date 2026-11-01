import { useRef, useState } from "react";
import type { ChangeEvent, ClipboardEvent, KeyboardEvent, RefObject } from "react";

const OTP_LENGTH = 6;

export interface UseOtpInputsResult {
    digits: string[];
    submitted: boolean;
    otp: string;
    isComplete: boolean;
    inputRefs: RefObject<(HTMLInputElement | null)[]>;
    handleDigitChange: (index: number) => (event: ChangeEvent<HTMLInputElement>) => void;
    handlePaste: (index: number) => (event: ClipboardEvent<HTMLInputElement>) => void;
    handleKeyDown: (index: number) => (event: KeyboardEvent<HTMLInputElement>) => void;
    validate: () => boolean;
    clear: () => void;
}

export function useOtpInputs(onChange: () => void): UseOtpInputsResult {
    const [state, setState] = useState({ digits: Array<string>(OTP_LENGTH).fill(""), submitted: false });
    const { digits, submitted } = state;
    const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null));
    const isComplete = digits.every((digit) => /^\d$/u.test(digit));

    function handleDigitChange(index: number) {
        return (event: ChangeEvent<HTMLInputElement>): void => {
            const value = event.target.value.replace(/\D/g, "").slice(0, 1);
            setState((previous) => ({ ...previous, digits: previous.digits.map((digit, position) => position === index ? value : digit) }));
            onChange();
            if (value) inputRefs.current[Math.min(index + 1, OTP_LENGTH - 1)]?.focus();
        };
    }

    function handlePaste(index: number) {
        return (event: ClipboardEvent<HTMLInputElement>): void => {
            event.preventDefault();
            const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH - index);
            if (!pasted) return;
            setState((previous) => ({ ...previous, digits: previous.digits.map((digit, position) => position >= index && position < index + pasted.length ? pasted[position - index] : digit) }));
            onChange();
            inputRefs.current[Math.min(index + pasted.length - 1, OTP_LENGTH - 1)]?.focus();
        };
    }

    function handleKeyDown(index: number) {
        return (event: KeyboardEvent<HTMLInputElement>): void => {
            if (event.key === "Backspace" && !digits[index] && index > 0) {
                event.preventDefault();
                inputRefs.current[index - 1]?.focus();
            }
        };
    }

    function validate(): boolean {
        setState((previous) => ({ ...previous, submitted: true }));
        if (!isComplete) inputRefs.current[digits.findIndex((digit) => !digit)]?.focus();
        return isComplete;
    }

    function clear(): void {
        setState({ digits: Array<string>(OTP_LENGTH).fill(""), submitted: false });
    }

    return { digits, submitted, otp: digits.join(""), isComplete, inputRefs, handleDigitChange, handlePaste, handleKeyDown, validate, clear };
}
