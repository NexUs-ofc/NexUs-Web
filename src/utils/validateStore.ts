import type { Store, StoreFormData, StoreFormErrors, StoreFormMode, StorePayload } from "../types/store";
import { applyPatternMask, maskCnpj } from "./masks";

export const STORE_MAX_LENGTH = {
    name: 100, cnpj: 18, cep: 9, phone: 15, street: 200, number: 20, neighborhood: 100,
    city: 100, state: 2, email: 254, openingTime: 5, closingTime: 5, photoDataUrl: 14_000_000,
} as const;

export const BRAZILIAN_STATES: ReadonlyArray<string> = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
    "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

export const EMPTY_STORE_FORM: StoreFormData = {
    name: "", cnpj: "", cep: "", phone: "", street: "", number: "", neighborhood: "", city: "", state: "", email: "", openingTime: "", closingTime: "", photoDataUrl: "",
};

export function maskStoreCep(value: string): string {
    return applyPatternMask(value, "#####-###");
}

export function maskStorePhone(value: string): string {
    return applyPatternMask(value, value.replace(/\D/gu, "").length > 10 ? "(##) #####-####" : "(##) ####-####");
}

export function maskStoreTime(value: string): string {
    return applyPatternMask(value, "##:##");
}

export function isStoreTime(value: string): boolean {
    return /^(?:[01]\d|2[0-3]):[0-5]\d$/u.test(value);
}

export function toStoreForm(store: Store): StoreFormData {
    return {
        name: store.name, city: store.city, state: store.state,
        cnpj: maskCnpj(store.cnpj ?? ""), cep: maskStoreCep(store.cep ?? ""),
        phone: maskStorePhone(store.phones?.[0] ?? ""), street: store.street,
        number: store.number, neighborhood: store.neighborhood, email: "",
        openingTime: store.openingTime, closingTime: store.closingTime, photoDataUrl: store.storeImageUrl,
    };
}

export function sanitizeStoreData(data: StoreFormData): StoreFormData {
    const clean = (value: string): string => value.replace(/\p{Cc}/gu, "").trim().replace(/\s+/gu, " ");
    return {
        name: clean(data.name), cnpj: clean(data.cnpj), cep: clean(data.cep), phone: clean(data.phone),
        street: clean(data.street), number: clean(data.number), neighborhood: clean(data.neighborhood),
        city: clean(data.city), state: clean(data.state).toUpperCase(),
        email: clean(data.email).toLowerCase(), openingTime: clean(data.openingTime),
        closingTime: clean(data.closingTime), photoDataUrl: data.photoDataUrl,
    };
}

export function isValidCnpj(value: string): boolean {
    const digits = value.replace(/\D/gu, "");
    if (digits.length !== 14 || /^(\d)\1+$/u.test(digits)) return false;
    const check = (length: number): number => {
        let weight = length - 7;
        let sum = 0;
        for (let position = 0; position < length; position += 1) {
            sum += Number(digits[position]) * weight;
            weight = weight === 2 ? 9 : weight - 1;
        }
        const remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    };
    return check(12) === Number(digits[12]) && check(13) === Number(digits[13]);
}

export function validateStoreForm(data: StoreFormData, mode: StoreFormMode): StoreFormErrors {
    const clean = sanitizeStoreData(data);
    const errors: StoreFormErrors = { ...EMPTY_STORE_FORM };
    const labels: Record<keyof StoreFormData, string> = {
        name: "nome da filial", cnpj: "CNPJ", cep: "CEP", phone: "telefone", street: "rua", number: "número", neighborhood: "bairro",
        city: "nome da cidade", state: "estado", email: "e-mail", openingTime: "horário de abertura", closingTime: "horário de fechamento", photoDataUrl: "foto da loja",
    };
    for (const field of Object.keys(STORE_MAX_LENGTH) as Array<keyof StoreFormData>) {
        if (data[field].length > STORE_MAX_LENGTH[field]) {
            errors[field] = `O campo ${labels[field]} deve ter no máximo ${STORE_MAX_LENGTH[field]} caracteres.`;
        }
    }
    for (const field of ["name", "cnpj", "street"] as const) {
        if (!clean[field]) errors[field] = `Informe ${labels[field]}.`;
    }
    if (mode === "create" && !clean.email) errors.email = "Informe o e-mail da filial.";
    if (clean.state && !BRAZILIAN_STATES.includes(clean.state)) errors.state = "Selecione uma UF válida.";
    if (clean.cnpj && (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/u.test(clean.cnpj) || !isValidCnpj(clean.cnpj))) {
        errors.cnpj = "Informe um CNPJ válido, com 14 dígitos e dígitos verificadores corretos.";
    }
    if (clean.cep && !/^\d{5}-\d{3}$/u.test(clean.cep)) errors.cep = "Informe um CEP válido com 8 dígitos.";
    if (clean.phone && !/^\([1-9]\d\) \d{4,5}-\d{4}$/u.test(clean.phone)) errors.phone = "Informe um telefone válido com DDD e 10 ou 11 dígitos.";
    for (const field of ["openingTime", "closingTime"] as const) {
        if (clean[field] && !isStoreTime(clean[field])) errors[field] = "Informe um horário válido entre 00:00 e 23:59 (HH:mm).";
    }
    if (clean.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(clean.email)) errors.email = "Informe um e-mail válido, como filial@empresa.com.br.";
    if (clean.photoDataUrl && !isStorePhotoDataUrl(clean.photoDataUrl) && !(mode === "edit" && isStoreImageUrl(clean.photoDataUrl))) errors.photoDataUrl = "Selecione uma foto PNG, JPEG ou WebP de até 10 MB.";
    return errors;
}

export function isStorePhotoDataUrl(value: string): boolean {
    return value.length <= STORE_MAX_LENGTH.photoDataUrl && /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/u.test(value);
}

export function isStoreImageUrl(value: string): boolean {
    if (value.length > 4096) return false;
    try { return ["https:", "http:"].includes(new URL(value).protocol); } catch { return false; }
}

export function toStorePayload(data: StoreFormData): StorePayload {
    return {
        cnpj: data.cnpj.replace(/\D/gu, ""), name: data.name,
        ...(data.phone ? { phones: [data.phone.replace(/\D/gu, "")] } : {}),
        address: { street: data.street, number: data.number, neighborhood: data.neighborhood,
            ...(data.cep ? { cep: data.cep.replace(/\D/gu, "") } : {}), city: data.city, state: data.state },
        ...(data.openingTime ? { openingTime: data.openingTime } : {}),
        ...(data.closingTime ? { closingTime: data.closingTime } : {}),
    };
}

export function isStoreFormValid(errors: StoreFormErrors): boolean {
    return Object.values(errors).every((error) => error === "");
}

export function toValidatedStoreData(data: StoreFormData, mode: StoreFormMode): StoreFormData {
    const errors = validateStoreForm(data, mode);
    if (!isStoreFormValid(errors)) throw new Error(Object.values(errors).find((error) => error !== ""));
    return sanitizeStoreData(data);
}
