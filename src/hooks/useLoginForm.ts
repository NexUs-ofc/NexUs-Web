import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useLogin } from "./useLogin";
import { validateLoginForm } from "../utils/validateLogin";
import type { LoginFormData, LoginFormErrors } from "../utils/validateLogin";

const initialForm: LoginFormData = { email: "", password: "" };
const initialErrors: LoginFormErrors = { email: "", password: "" };

export function useLoginForm() {
    const [state, setState] = useState(() => ({ form: initialForm as LoginFormData, fieldErrors: initialErrors as LoginFormErrors }));
    const { form, fieldErrors } = state;
    const formRef = useRef<HTMLFormElement>(null);
    const navigate = useNavigate();

    const { loading, error, success, execute, reset } = useLogin();

    useEffect(() => {
        document.title = "Entrar — NexUs";
    }, []);

    const handleChange = useCallback(
        (field: keyof LoginFormData) => (event: ChangeEvent<HTMLInputElement>) => {
            const nextForm = { ...form, [field]: event.target.value };
            setState((previous) => ({ ...previous, form: nextForm }));
            reset();
            setState((previous) => ({ ...previous, fieldErrors: validateLoginForm(nextForm) }));
        },
        [form, reset],
    );

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        const validation = validateLoginForm(form);
        setState((previous) => ({ ...previous, fieldErrors: validation }));
        if (Object.values(validation).some(Boolean)) {
            requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus());
            return;
        }
        const authenticated = await execute(form);
        if (authenticated) {
            navigate("/dashboard", { replace: true });
        }
    }

    return { formRef, form, fieldErrors, loading, error, success, handleChange, handleSubmit };
}
