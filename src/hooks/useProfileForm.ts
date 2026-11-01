import { useRef, useState } from "react";
import type { FormEvent } from "react";
import type { Profile, ProfileAddress, ProfileFormData, ProfileFormErrors } from "../types/profile";
import { EMPTY_PROFILE_ADDRESS, isProfileFormValid, toProfileForm, validateProfileForm } from "../utils/validateProfile";
import { useCepLookup } from "./useCepLookup";
import type { CepAddress } from "../types/cep";

export interface UseProfileFormOptions {
    profile: Profile;
    onSave: (data: ProfileFormData) => Promise<boolean>;
    onSaved: () => void;
}

export function useProfileForm({ profile, onSave, onSaved }: UseProfileFormOptions) {
    const [form, setForm] = useState(() => toProfileForm(profile));
    const [errors, setErrors] = useState<ProfileFormErrors>({ name: "", phones: [], address: { ...EMPTY_PROFILE_ADDRESS } });
    const formRef = useRef<HTMLFormElement>(null);
    const submitting = useRef(false);
    const editedAddressFields = useRef(new Set<keyof ProfileAddress>());
    const cepLookup = useCepLookup((address, cep) => {
        const fields = (Object.keys(address) as Array<keyof CepAddress>).filter((field) => !editedAddressFields.current.has(field));
        setForm((previous) => {
            if (previous.address.cep.replace(/\D/gu, "") !== cep) return previous;
            const nextAddress = { ...previous.address };
            for (const field of fields) nextAddress[field] = address[field];
            return { ...previous, address: nextAddress };
        });
        setErrors((previous) => {
            const nextErrors = { ...previous.address };
            for (const field of fields) nextErrors[field] = "";
            return { ...previous, address: nextErrors };
        });
    });

    function changeName(value: string): void {
        setForm((previous) => ({ ...previous, name: value }));
        setErrors((previous) => ({ ...previous, name: "" }));
    }

    function changePhone(index: number, value: string): void {
        setForm((previous) => ({ ...previous, phones: previous.phones.map((phone, position) => position === index ? value : phone) }));
        setErrors((previous) => ({ ...previous, phones: previous.phones.map((error, position) => position === index ? "" : error) }));
    }

    function addPhone(): void {
        setForm((previous) => ({ ...previous, phones: [...previous.phones, ""] }));
        requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>("[data-profile-phone]:last-of-type input")?.focus());
    }

    function removePhone(index: number): void {
        setForm((previous) => ({ ...previous, phones: previous.phones.filter((_, position) => position !== index) }));
        setErrors((previous) => ({ ...previous, phones: previous.phones.filter((_, position) => position !== index) }));
        requestAnimationFrame(() => formRef.current?.querySelector<HTMLButtonElement>("[data-add-phone]")?.focus());
    }

    function changeAddress(field: keyof ProfileAddress, value: string): void {
        setForm((previous) => ({ ...previous, address: { ...previous.address, [field]: value } }));
        setErrors((previous) => ({ ...previous, address: { ...previous.address, [field]: "" } }));
        if (field === "cep") {
            editedAddressFields.current.clear();
            void cepLookup.lookup(value);
        } else editedAddressFields.current.add(field);
    }

    async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        if (submitting.current || cepLookup.loading) return;
        const validation = validateProfileForm(form, Boolean(profile.address) || profile.profileType === "HOUSEHOLD" || profile.profileType === "STORE");
        setErrors(validation);
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

    return { form, errors, formRef, cepLookup, changeName, changePhone, addPhone, removePhone, changeAddress, submit };
}
