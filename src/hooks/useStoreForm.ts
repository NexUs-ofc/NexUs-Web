import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";
import type { StoreFormData, StoreFormErrors, StoreFormMode } from "../types/store";
import { EMPTY_STORE_FORM, isStoreFormValid, sanitizeStoreData, validateStoreForm } from "../utils/validateStore";
import type { PostalAddress } from "../types/address";
import { useStoreAddress } from "./useStoreAddress";
import type { UseStoreAddressResult } from "./useStoreAddress";

const ADDRESS_FIELDS = ["street", "neighborhood", "city", "state"] as const;

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
    addressLookup: UseStoreAddressResult;
    changeField: (field: keyof StoreFormData, value: string) => void;
    submit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useStoreForm({ initialData, mode, onSave, onSaved }: UseStoreFormOptions): UseStoreFormResult {
    const [form, setForm] = useState<StoreFormData>(initialData);
    const [errors, setErrors] = useState<StoreFormErrors>({ ...EMPTY_STORE_FORM });
    const formRef = useRef<HTMLFormElement>(null);
    const submitting = useRef(false);
    const applyAddress = useCallback((address: PostalAddress): void => {
        setForm((previous) => previous.cep.replace(/\D/gu, "") === address.cep ? {
            ...previous, street: address.street, neighborhood: address.neighborhood, city: address.city, state: address.state,
        } : previous);
        setErrors((previous) => ({ ...previous, cep: "", street: "", neighborhood: "", city: "", state: "" }));
    }, []);
    const addressLookup = useStoreAddress(form.cep, applyAddress);

    useEffect(() => {
        if (mode === "edit") formRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
    }, [mode]);

    function changeField(field: keyof StoreFormData, value: string): void {
        if (ADDRESS_FIELDS.some((name) => name === field) && (addressLookup.loading || addressLookup.address !== null)) return;
        if (field === "cep" && value.replace(/\D/gu, "") !== form.cep.replace(/\D/gu, "")) {
            addressLookup.retry();
            setForm((previous) => ({ ...previous, cep: value, street: "", neighborhood: "", city: "", state: "" }));
            setErrors((previous) => ({ ...previous, cep: "", street: "", neighborhood: "", city: "", state: "" }));
            return;
        }
        setForm((previous) => ({ ...previous, [field]: value }));
        setErrors((previous) => ({ ...previous, [field]: "" }));
    }

    async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        if (submitting.current) return;
        const validation = validateStoreForm(form, mode);
        if (addressLookup.loading) validation.cep = "Aguarde a consulta do CEP.";
        else if (addressLookup.error) validation.cep = addressLookup.error;
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

    return { form, errors, formRef, addressLookup, changeField, submit };
}
