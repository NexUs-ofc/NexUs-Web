import { useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";
import type { StoreFormData, StoreFormErrors, StoreFormMode } from "../types/store";
import { EMPTY_STORE_FORM, isStoreFormValid, sanitizeStoreData, validateStoreForm } from "../utils/validateStore";

export interface UseStoreFormOptions {
    initialData: StoreFormData;
    mode: StoreFormMode;
    onSave: (data: StoreFormData) => Promise<boolean>;
    onSaved: () => void;
}

export interface UseStoreFormResult {
    form: StoreFormData;
    errors: StoreFormErrors;
    formRef: RefObject<HTMLFormElement | null>;
    changeField: (field: keyof StoreFormData, value: string) => void;
    submit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useStoreForm({ initialData, mode, onSave, onSaved }: UseStoreFormOptions): UseStoreFormResult {
    const [form, setForm] = useState<StoreFormData>(initialData);
    const [errors, setErrors] = useState<StoreFormErrors>({ ...EMPTY_STORE_FORM });
    const formRef = useRef<HTMLFormElement>(null);
    const submitting = useRef(false);

    function changeField(field: keyof StoreFormData, value: string): void {
        setForm((previous) => ({ ...previous, [field]: value }));
        setErrors((previous) => ({ ...previous, [field]: "" }));
    }

    async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        if (submitting.current) return;
        const validation = validateStoreForm(form, mode);
        setErrors(validation);
        if (!isStoreFormValid(validation)) {
            const first = (Object.keys(validation) as Array<keyof StoreFormData>).find((field) => validation[field] !== "");
            requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${first}"]`)?.focus());
            return;
        }
        submitting.current = true;
        try {
            const saved = await onSave(sanitizeStoreData(form));
            if (saved && formRef.current !== null) onSaved();
        } finally { submitting.current = false; }
    }

    return { form, errors, formRef, changeField, submit };
}
