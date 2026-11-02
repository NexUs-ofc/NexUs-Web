import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, RefObject } from "react";
import type { StoreFormData, StoreFormErrors, StoreFormMode } from "../types/store";
import { EMPTY_STORE_FORM, isStoreFormValid, sanitizeStoreData, validateStoreForm } from "../utils/validateStore";
import type { PostalAddress } from "../types/address";
import { useAddressLookup } from "./useAddressLookup";
import type { UseAddressLookupResult } from "./useAddressLookup";

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
    addressLookup: UseAddressLookupResult;
    changeField: (field: keyof StoreFormData, value: string) => void;
    submit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
}

export function useStoreForm({ initialData, mode, onSave, onSaved }: UseStoreFormOptions): UseStoreFormResult {
    const [state, setState] = useState(() => ({ form: initialData as StoreFormData, errors: { ...EMPTY_STORE_FORM } as StoreFormErrors }));
    const { form, errors } = state;

    const formRef = useRef<HTMLFormElement>(null);
    const submitting = useRef(false);
    const applyAddress = useCallback((address: PostalAddress): void => {
        setState((previous) => previous.form.cep.replace(/\D/gu, "") === address.cep ? {
            form: { ...previous.form, street: address.street, neighborhood: address.neighborhood, city: address.city, state: address.state },
            errors: { ...previous.errors, cep: "", street: "", neighborhood: "", city: "", state: "" },
        } : previous);
    }, []);
    const addressLookup = useAddressLookup(form.cep, applyAddress);

    useEffect(() => {
        if (mode === "edit") formRef.current?.querySelector<HTMLInputElement>('input[name="name"]')?.focus();
    }, [mode]);

    function changeField(field: keyof StoreFormData, value: string): void {
        if (ADDRESS_FIELDS.some((name) => name === field) && (addressLookup.loading || addressLookup.address !== null)) return;
        if (field === "cep" && value.replace(/\D/gu, "") !== form.cep.replace(/\D/gu, "")) {
            addressLookup.retry();
            setState((previous) => ({ ...previous, form: ({ ...previous.form, cep: value, street: "", neighborhood: "", city: "", state: "" }), errors: ({ ...previous.errors, cep: "", street: "", neighborhood: "", city: "", state: "" }) }));
            return;
        }
        setState((previous) => ({ ...previous, form: ({ ...previous.form, [field]: value }), errors: ({ ...previous.errors, [field]: "" }) }));
    }

    async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        if (submitting.current) return;
        const validation = validateStoreForm(form, mode);
        if (addressLookup.loading) validation.cep = "Aguarde a consulta do CEP.";
        else if (addressLookup.error) validation.cep = addressLookup.error;
        setState((previous) => ({ ...previous, errors: validation }));
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
