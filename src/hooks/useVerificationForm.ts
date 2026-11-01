import { useCallback, useEffect, useRef, useState } from "react";
import type {
    ChangeEvent,
    ClipboardEvent,
    FormEvent,
    KeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { useVerifyRegistration } from "./useVerifyRegistration";
import { loadRegistrationId } from "../utils/registrationStorage";

const OTP_LENGTH = 6;

export function useVerificationForm() {
    const [state, setState] = useState(() => ({ digits: Array(OTP_LENGTH).fill("") as string[], submitted: false, activeIndex: 0, registrationId: loadRegistrationId() }));
    const { digits, submitted, activeIndex, registrationId } = state;
    const navigate = useNavigate();
    const { loading, error, success, execute, reset } = useVerifyRegistration();

    const previousActiveIndex = useRef(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>(
        Array(OTP_LENGTH).fill(null),
    );

    const otp = digits.join("");
    const isComplete = digits.every((digit) => digit.length === 1);

    useEffect(() => {
        if (previousActiveIndex.current === activeIndex) return;
        previousActiveIndex.current = activeIndex;
        inputRefs.current[activeIndex]?.focus();
    }, [activeIndex]);

    useEffect(() => {
        if (!registrationId || !isComplete || loading || success || error) {
            return;
        }
        void execute({ registrationId, otp });
    }, [isComplete, otp, execute, registrationId, loading, success, error]);

    useEffect(() => {
        if (!registrationId) {
            navigate("/cadastro", { replace: true });
        }
    }, [registrationId, navigate]);

    useEffect(() => {
        if (success) {
            navigate("/dashboard", { replace: true });
        }
    }, [success, navigate]);

    const handleDigitChange = useCallback(
        (index: number) => (event: ChangeEvent<HTMLInputElement>): void => {
            const value = event.target.value.replace(/\D/g, "").slice(0, 1);
            const next = [...digits];
            next[index] = value;
            setState((previous) => ({ ...previous, digits: next }));
            reset();
            if (value && index < OTP_LENGTH - 1) {
                setState((previous) => ({ ...previous, activeIndex: index + 1 }));
            }
        },
        [digits, reset],
    );

    const handlePaste = useCallback(
        (index: number) => (event: ClipboardEvent<HTMLInputElement>): void => {
            event.preventDefault();
            const pasted = event.clipboardData
                .getData("text")
                .replace(/\D/g, "")
                .slice(0, OTP_LENGTH);
            if (!pasted) return;
            const next = [...digits];
            for (let i = 0; i < pasted.length && index + i < OTP_LENGTH; i += 1) {
                next[index + i] = pasted[i];
            }
            setState((previous) => ({ ...previous, digits: next }));
            reset();
            const nextFocus = Math.max(0, Math.min(index + pasted.length - 1, OTP_LENGTH - 1));
            setState((previous) => ({ ...previous, activeIndex: nextFocus }));
        },
        [digits, reset],
    );

    const handleKeyDown = useCallback(
        (index: number) => (event: KeyboardEvent<HTMLInputElement>): void => {
            if (event.key === "Backspace" && digits[index] === "" && index > 0) {
                event.preventDefault();
                setState((previous) => ({ ...previous, activeIndex: index - 1 }));
            }
        },
        [digits],
    );

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        setState((previous) => ({ ...previous, submitted: true }));
        if (!registrationId || !isComplete) {
            inputRefs.current[digits.findIndex((digit) => !digit)]?.focus();
            return;
        }
        void execute({ registrationId, otp });
    };

    useEffect(() => {
        if (!loading && error) inputRefs.current[activeIndex]?.focus();
    }, [loading, error, activeIndex]);

    return { submitted, registrationId, loading, error, success, digits, inputRefs, isComplete, handleDigitChange, handleKeyDown, handlePaste, handleSubmit };
}
