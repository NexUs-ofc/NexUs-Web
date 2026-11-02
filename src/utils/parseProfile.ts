import type { Profile, ProfileAddress, ProfileImageResponse } from "../types/profile";
import type { Company } from "../types/company";
import { asRecord, asText, asNumber } from "./responseParsers";
import { isStoreImageUrl, BRAZILIAN_STATES } from "./validateStore";
import { parseExpiration } from "./validateAuth";

function id(value: unknown): number {
    const result = asNumber(value);
    if (!Number.isSafeInteger(result) || result < 1) throw new Error("Identificador da API inválido.");
    return result;
}

function text(value: unknown, max: number): string {
    if (typeof value !== "string" || value.length > max || /\p{Cc}/u.test(value)) throw new Error("Campo do perfil inválido.");
    return value.trim();
}

function imageUrl(value: unknown): string | null {
    if (value === null) return null;
    if (typeof value !== "string" || !isStoreImageUrl(value)) throw new Error("URL da foto inválida.");
    return value;
}

export function parseProfileAddress(value: unknown): ProfileAddress {
    const data = asRecord(value);
    const state = text(data.state, 2).toUpperCase();
    if (state && !BRAZILIAN_STATES.includes(state)) throw new Error("UF do perfil inválida.");
    const cep = text(data.cep, 9);
    if (cep && !/^\d{5}-?\d{3}$/u.test(cep)) throw new Error("CEP do perfil inválido.");
    return { street: text(data.street, 200), number: text(data.number, 20), neighborhood: text(data.neighborhood, 100),
        city: text(data.city, 100), state, cep };
}

export function parseProfile(value: unknown): Profile {
    const data = asRecord(value);
    const profileType = data.profileType;
    const profileStatus = data.profileStatus;
    if (profileType !== "HOUSEHOLD" && profileType !== "BUSINESS" && profileType !== "COMPANY" && profileType !== "STORE" && profileType !== "ADMIN") throw new Error("Tipo de perfil inválido.");
    if (profileStatus !== "ACTIVE" && profileStatus !== "INACTIVE" && profileStatus !== "PENDING") throw new Error("Status de perfil inválido.");
    const email = text(data.email, 254);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) throw new Error("E-mail do perfil inválido.");
    if (!Array.isArray(data.phones) || data.phones.length > 50) throw new Error("Telefones do perfil inválidos.");
    return { id: id(data.id), name: asText(data.name, 150), email, profileType, profileStatus,
        profileImageUrl: imageUrl(data.profileImageUrl), createdAt: parseExpiration(data.createdAt),
        phones: data.phones.map((phone: unknown) => text(phone, 30)), address: data.address === null ? null : parseProfileAddress(data.address) };
}

export function parseProfileImage(value: unknown): ProfileImageResponse {
    const data = asRecord(value);
    return { profileId: id(data.profileId), profileImageUrl: imageUrl(data.profileImageUrl) };
}

export function parseCompany(value: unknown): Company {
    const data = asRecord(value);
    const cnpj = text(data.cnpj, 18);
    if (!/^(?:\d{14}|\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})$/u.test(cnpj)) throw new Error("CNPJ da empresa inválido.");
    const storeCount = asNumber(data.storeCount);
    if (!Number.isSafeInteger(storeCount)) throw new Error("Quantidade de filiais inválida.");
    return { id: id(data.id), cnpj, planId: id(data.planId), planName: asText(data.planName, 100), planPrice: asNumber(data.planPrice), storeCount };
}
