import { useCallback, useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Profile, ProfileAddress, ProfileFormData, ProfileFormErrors } from "../types/profile";
import { EMPTY_PROFILE_ADDRESS, isProfileFormValid, toProfileForm, validateProfileForm } from "../utils/validateProfile";
import { useAddressLookup } from "./useAddressLookup";
import type { PostalAddress } from "../types/address";

const ADDRESS_FIELDS = ["street", "neighborhood", "city", "state"] as const;

export interface UseProfileFormOptions {
    profile: Profile;
    onSave: (data: ProfileFormData) => Promise<boolean>;
    onSaved: () => void;
}

export function useProfileForm({ profile, onSave, onSaved }: UseProfileFormOptions) {
    const [state, setState] = useState(() => {
        const form = toProfileForm(profile);
        return { form, phoneKeys: form.phones.map((_, index) => `initial-${index}`),
            errors: { name: "", phones: [], address: { ...EMPTY_PROFILE_ADDRESS } } as ProfileFormErrors };
    });
    const { form, errors, phoneKeys } = state;
    const nextPhoneId = useRef(0);

    const formRef = useRef<HTMLFormElement>(null);
    const submitting = useRef(false);
    const applyAddress = useCallback((address: PostalAddress): void => {
        setState((previous) => {
            if (previous.form.address.cep.replace(/\D/gu, "") !== address.cep) return previous;
            const nextAddress = { ...previous.form.address };
            const nextErrors = { ...previous.errors.address, cep: "" };
            for (const field of ADDRESS_FIELDS) { nextAddress[field] = address[field]; nextErrors[field] = ""; }
            return { ...previous, form: { ...previous.form, address: nextAddress }, errors: { ...previous.errors, address: nextErrors } };
        });
    }, []);
    const addressLookup = useAddressLookup(form.address.cep, applyAddress);

    function changeName(value: string): void {
        setState((previous) => ({ ...previous, form: ({ ...previous.form, name: value }), errors: ({ ...previous.errors, name: "" }) }));
    }

    function changePhone(index: number, value: string): void {
        setState((previous) => ({ ...previous, form: ({ ...previous.form, phones: previous.form.phones.map((phone, position) => position === index ? value : phone) }), errors: ({ ...previous.errors, phones: previous.errors.phones.map((error, position) => position === index ? "" : error) }) }));
    }

    function addPhone(): void {
        const key = `new-${nextPhoneId.current++}`;
        setState((previous) => ({ ...previous, phoneKeys: [...previous.phoneKeys, key], form: { ...previous.form, phones: [...previous.form.phones, ""] } }));
        requestAnimationFrame(() => formRef.current?.querySelectorAll<HTMLInputElement>("[data-profile-phone] input").item(form.phones.length)?.focus());
    }

    function removePhone(index: number): void {
        setState((previous) => ({ ...previous, phoneKeys: previous.phoneKeys.filter((_, position) => position !== index), form: ({ ...previous.form, phones: previous.form.phones.filter((_, position) => position !== index) }), errors: ({ ...previous.errors, phones: previous.errors.phones.filter((_, position) => position !== index) }) }));
        requestAnimationFrame(() => formRef.current?.querySelector<HTMLButtonElement>("[data-add-phone]")?.focus());
    }

    function changeAddress(field: keyof ProfileAddress, value: string): void {
        if (ADDRESS_FIELDS.some((name) => name === field) && (addressLookup.loading || addressLookup.address !== null)) return;
        if (field === "cep" && value.replace(/\D/gu, "") !== form.address.cep.replace(/\D/gu, "")) {
            addressLookup.retry();
            setState((previous) => ({ ...previous, form: ({ ...previous.form, address: { ...previous.form.address, cep: value, street: "", neighborhood: "", city: "", state: "" } }), errors: ({ ...previous.errors, address: { ...previous.errors.address, cep: "", street: "", neighborhood: "", city: "", state: "" } }) }));
            return;
        }
        setState((previous) => ({ ...previous, form: ({ ...previous.form, address: { ...previous.form.address, [field]: value } }), errors: ({ ...previous.errors, address: { ...previous.errors.address, [field]: "" } }) }));
    }

    async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        if (submitting.current) return;
        const validation = validateProfileForm(form, Boolean(profile.address) || profile.profileType === "HOUSEHOLD" || profile.profileType === "STORE");
        if (addressLookup.loading) validation.address.cep = "Aguarde a consulta do CEP.";
        else if (addressLookup.error) validation.address.cep = addressLookup.error;
        setState((previous) => ({ ...previous, errors: validation }));
        if (!isProfileFormValid(validation)) {
            requestAnimationFrame(() => {
                const first = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
                const details = first?.closest("details");
                if (details) details.open = true;
                first?.focus();
            });
            return;
        }
        submitting.current = true;
        try {
            if (await onSave(form) && formRef.current) onSaved();
        } finally { submitting.current = false; }
    }

    return { form, errors, phoneKeys, formRef, addressLookup, changeName, changePhone, addPhone, removePhone, changeAddress, submit };
}
