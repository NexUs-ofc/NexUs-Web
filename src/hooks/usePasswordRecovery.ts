import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, RefObject } from "react";
import { useLocation } from "react-router-dom";
import { forgotPassword, resetPassword, verifyPasswordReset } from "../services/auth.service";
import type { PasswordRecoveryFields, PasswordRecoveryStep } from "../types/passwordRecovery";
import { readRecoveryEmail } from "../utils/validatePasswordRecovery";
import { validateEmail } from "../utils/validateLogin";
import { validatePassword, validatePasswordConfirmation } from "../utils/validateRegistration";
import { useOtpInputs } from "./useOtpInputs";
import type { UseOtpInputsResult } from "./useOtpInputs";
import { maskEmail } from "../utils/masks";

interface PasswordRecoveryState {
    step: PasswordRecoveryStep;
    form: PasswordRecoveryFields;
    fieldErrors: PasswordRecoveryFields;
    loading: boolean;
    error: string;
}

export interface UsePasswordRecoveryResult extends PasswordRecoveryState {
    formRef: RefObject<HTMLFormElement | null>;
    otpControls: UseOtpInputsResult;
    maskedEmail: string;
    handleChange: (field: keyof PasswordRecoveryFields) => (event: ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
    restart: () => void;
}

const emptyFields: PasswordRecoveryFields = { email: "", newPassword: "", passwordConfirmation: "" };

export function usePasswordRecovery(): UsePasswordRecoveryResult {
    const location = useLocation();
    const [state, setState] = useState<PasswordRecoveryState>(() => ({
        step: { stage: "email" },
        form: { ...emptyFields, email: readRecoveryEmail(location.state) },
        fieldErrors: emptyFields,
        loading: false,
        error: "",
    }));
    const formRef = useRef<HTMLFormElement>(null);
    const mountedRef = useRef(true);
    const requestRef = useRef<AbortController | null>(null);
    const otpControls = useOtpInputs(() => setState((previous) => ({ ...previous, error: "" })));
    const { step, form, loading, error } = state;
    const { isComplete, otp } = otpControls;

    useEffect(() => {
        document.title = "Recuperar senha — NexUs";
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            requestRef.current?.abort();
        };
    }, []);

    useEffect(() => {
        if (!loading && error) formRef.current?.querySelector<HTMLElement>("[aria-invalid=true], input")?.focus();
    }, [loading, error]);

    useEffect(() => {
        if (step.stage === "verification" && isComplete && !loading && !error) {
            formRef.current?.requestSubmit();
        }
    }, [step.stage, isComplete, otp, loading, error]);

    function handleChange(field: keyof PasswordRecoveryFields) {
        return (event: ChangeEvent<HTMLInputElement>): void => {
            const value = event.target.value;
            setState((previous) => ({ ...previous, form: { ...previous.form, [field]: value }, fieldErrors: emptyFields, error: "" }));
        };
    }

    function restart(): void {
        if (requestRef.current) return;
        otpControls.clear();
        setState((previous) => ({ ...previous, step: { stage: "email" }, form: { ...emptyFields, email: previous.form.email }, fieldErrors: emptyFields, error: "" }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        if (requestRef.current || step.stage === "success") return;
        const fieldErrors = { ...emptyFields };
        if (step.stage === "email") fieldErrors.email = validateEmail(form.email.trim().toLowerCase());
        if (step.stage === "password") {
            fieldErrors.newPassword = validatePassword(form.newPassword);
            fieldErrors.passwordConfirmation = validatePasswordConfirmation(form.newPassword, form.passwordConfirmation);
        }
        setState((previous) => ({ ...previous, fieldErrors, error: "" }));
        if (Object.values(fieldErrors).some(Boolean)) {
            requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
            return;
        }
        if (step.stage === "verification" && !otpControls.validate()) return;

        const controller = new AbortController();
        requestRef.current = controller;
        let timedOut = false;
        const timeout = window.setTimeout(() => { timedOut = true; controller.abort(); }, 30000);
        setState((previous) => ({ ...previous, loading: true }));
        try {
            let nextStep: PasswordRecoveryStep;
            if (step.stage === "email") {
                const { resetId } = await forgotPassword({ email: form.email }, { signal: controller.signal });
                nextStep = { stage: "verification", resetId };
            } else if (step.stage === "verification") {
                const { resetTicket } = await verifyPasswordReset({ resetId: step.resetId, otp: otpControls.otp }, { signal: controller.signal });
                nextStep = { stage: "password", resetTicket };
            } else {
                await resetPassword({ resetTicket: step.resetTicket, newPassword: form.newPassword }, { signal: controller.signal });
                nextStep = { stage: "success" };
            }
            if (!mountedRef.current || controller.signal.aborted) return;
            otpControls.clear();
            setState((previous) => ({ ...previous, step: nextStep, loading: false, error: "", form: { ...emptyFields, email: previous.form.email.trim().toLowerCase() } }));
        } catch (requestError) {
            if (!mountedRef.current || (controller.signal.aborted && !timedOut)) return;
            setState((previous) => ({ ...previous, loading: false, error: timedOut ? "O servidor demorou para responder. Tente novamente." : requestError instanceof Error ? requestError.message : "Não foi possível recuperar a senha. Tente novamente." }));
        } finally {
            window.clearTimeout(timeout);
            if (requestRef.current === controller) requestRef.current = null;
        }
    }

    return { ...state, maskedEmail: maskEmail(form.email), formRef, otpControls, handleChange, handleSubmit, restart };
}
