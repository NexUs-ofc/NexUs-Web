import type { Profile, ProfileAddress, ProfileFormData, ProfileFormErrors, ProfileUpdatePayload } from "../types/profile";
import { BRAZILIAN_STATES, maskStoreCep } from "./validateStore";

export const EMPTY_PROFILE_ADDRESS: ProfileAddress = { street: "", number: "", neighborhood: "", cep: "", city: "", state: "" };
export const PROFILE_MAX_LENGTH = { name: 150, street: 150, number: 10, neighborhood: 100, cep: 9, city: 100, state: 2 } as const;

function formatNationalPhone(digits: string): string {
    if (!digits) return "";
    if (digits.length <= 2) return `(${digits}`;
    const subscriber = digits.slice(2);
    const split = subscriber.length > 8 ? 5 : 4;
    return `(${digits.slice(0, 2)}) ${subscriber.slice(0, split)}${subscriber.length > split ? `-${subscriber.slice(split)}` : ""}`;
}

function toInternationalPhone(value: string): string {
    return `${value.trimStart().startsWith("+") ? "+" : "+55"}${value.replace(/\D/gu, "")}`;
}

function displayPhone(value: string): string {
    const digits = value.replace(/\D/gu, "");
    if (value.trimStart().startsWith("+") && digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
        return formatNationalPhone(digits.slice(2));
    }
    return maskProfilePhone(value);
}

export function maskProfilePhone(value: string): string {
    const trimmed = value.trimStart();
    const digits = trimmed.replace(/\D/gu, "");
    if (!trimmed.startsWith("+")) return formatNationalPhone(digits);
    if (digits.startsWith("55")) return `+55${digits.length > 2 ? ` ${formatNationalPhone(digits.slice(2))}` : ""}`;
    return `+${trimmed.slice(1).replace(/[^\d ()-]/gu, "")}`;
}

export function toProfileForm(profile: Profile): ProfileFormData {
    return {
        name: profile.name,
        phones: profile.phones?.length ? profile.phones.map(displayPhone) : [""],
        address: { ...EMPTY_PROFILE_ADDRESS, ...profile.address, cep: maskStoreCep(profile.address?.cep ?? "") },
    };
}

export function toProfilePayload(data: ProfileFormData): ProfileUpdatePayload {
    const clean = (value: string): string => value.replace(/\p{Cc}/gu, "").trim().replace(/\s+/gu, " ");
    const address: ProfileAddress = {
        street: clean(data.address.street), number: clean(data.address.number), neighborhood: clean(data.address.neighborhood),
        cep: data.address.cep.replace(/\D/gu, ""), city: clean(data.address.city), state: clean(data.address.state).toUpperCase(),
    };
    return {
        name: clean(data.name),
        phones: [...new Set(data.phones.filter((phone) => phone.trim()).map(toInternationalPhone))],
        ...(Object.values(address).some(Boolean) ? { address } : {}),
    };
}

export function validateProfileForm(data: ProfileFormData, addressRequired: boolean): ProfileFormErrors {
    const errors: ProfileFormErrors = { name: "", phones: data.phones.map(() => ""), address: { ...EMPTY_PROFILE_ADDRESS } };
    if (!data.name.trim()) errors.name = "Informe o nome da empresa.";
    else if (data.name.length > PROFILE_MAX_LENGTH.name) errors.name = "O nome deve ter no máximo 150 caracteres.";
    errors.phones = data.phones.map((phone) => {
        if (!phone.trim()) return "";
        if (phone.length > 30) return "O telefone deve ter no máximo 30 caracteres.";
        if (!/^[\d ()+-]+$/u.test(phone)) return "Use apenas dígitos e os símbolos de telefone.";
        const normalized = toInternationalPhone(phone);
        const valid = normalized.startsWith("+55")
            ? /^[1-9]\d{9,10}$/u.test(normalized.slice(3))
            : /^\+[1-9]\d{7,14}$/u.test(normalized);
        return valid ? "" : "Informe um telefone válido com DDD e 10 ou 11 dígitos; para outros países, inclua + e o código do país.";
    });
    const payload = toProfilePayload(data);
    if (addressRequired || payload.address) {
        for (const key of Object.keys(data.address) as Array<keyof ProfileAddress>) {
            if (!data.address[key].trim()) errors.address[key] = "Preencha este campo do endereço.";
            else if (data.address[key].length > PROFILE_MAX_LENGTH[key]) errors.address[key] = `Use no máximo ${PROFILE_MAX_LENGTH[key]} caracteres.`;
        }
        if (data.address.cep && payload.address?.cep.length !== 8) errors.address.cep = "Informe um CEP com 8 dígitos.";
        if (data.address.state && !BRAZILIAN_STATES.includes(data.address.state.toUpperCase())) errors.address.state = "Selecione uma UF válida.";
    }
    return errors;
}

export function isProfileFormValid(errors: ProfileFormErrors): boolean {
    return !errors.name && errors.phones.every((error) => !error) && Object.values(errors.address).every((error) => !error);
}
