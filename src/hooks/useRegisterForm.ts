import { useCallback, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loadRegistrationDraft, saveRegistrationDraft } from "../utils/registrationStorage";
import {
    isRegistrationFormDataValid,
    toRegistrationDraft,
    validateRegistrationFormData,
} from "../utils/validateRegistration";
import type { RegistrationFormData, RegistrationFormErrors } from "../utils/validateRegistration";

const initialForm: RegistrationFormData = {
    name: "",
    cnpj: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirmation: "",
};

const initialErrors: RegistrationFormErrors = {
    name: "",
    cnpj: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirmation: "",
};

interface RegisterLocationState {
    registrationError: string;
}

function isRegisterLocationState(value: unknown): value is RegisterLocationState {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const record = value as Record<string, unknown>;
    return typeof record["registrationError"] === "string";
}

export function useRegisterForm() {
    const formRef = useRef<HTMLFormElement>(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [state, setState] = useState(() => {
        const draft = loadRegistrationDraft();
        const form: RegistrationFormData = draft ? {
            name: draft.name, cnpj: draft.cnpj, email: draft.email,
            phone: draft.phones[0] ?? "", password: draft.password, passwordConfirmation: "",
        } : initialForm;
        return { formRef, form, fieldErrors: draft ? validateRegistrationFormData(form) : initialErrors,
            touchedFields: new Set<keyof RegistrationFormData>(), hasSubmitted: false };
    });
    const { form, fieldErrors, touchedFields, hasSubmitted } = state;
    const registrationError = isRegisterLocationState(location.state)
        ? location.state.registrationError
        : "";

    const handleChange = useCallback(
        (field: keyof RegistrationFormData) => (event: ChangeEvent<HTMLInputElement>) => {
            const nextForm = { ...form, [field]: event.target.value };
            setState((previous) => ({ ...previous, form: nextForm, touchedFields: new Set(previous.touchedFields).add(field), fieldErrors: validateRegistrationFormData(nextForm) }));
        },
        [form],
    );

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        setState((previous) => ({ ...previous, hasSubmitted: true }));
        const errors = validateRegistrationFormData(form);
        setState((previous) => ({ ...previous, fieldErrors: errors }));
        if (!isRegistrationFormDataValid(errors)) {
            requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
            return;
        }
        saveRegistrationDraft(toRegistrationDraft(form));
        navigate("/planos");
    }

    return { formRef, form, fieldErrors, hasSubmitted, touchedFields, registrationError, handleChange, handleSubmit };
}
