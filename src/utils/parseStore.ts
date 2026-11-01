import type { Store, StoreImageResponse } from "../types/store";
import { BRAZILIAN_STATES, isStoreImageUrl, isStoreTime, STORE_MAX_LENGTH } from "./validateStore";

function record(value: unknown): Record<string, unknown> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("O core retornou dados de filial inválidos.");
    return value as Record<string, unknown>;
}

function text(value: unknown, max: number, nullable = false): string {
    if (nullable && value == null) return "";
    if (typeof value !== "string" || value.length > max) throw new Error("O core retornou um campo de filial inválido.");
    return value.replace(/\p{Cc}/gu, "").trim();
}

export function validateStoreId(id: string): string {
    if (!/^\d+$/u.test(id) || !Number.isSafeInteger(Number(id)) || Number(id) < 0) throw new Error("Identificador de filial inválido.");
    return id;
}

export function parseStoreImageUrl(value: unknown): string {
    const url = text(value, 4096, true);
    if (url && !isStoreImageUrl(url)) throw new Error("O core retornou uma URL de imagem inválida.");
    return url;
}

export function parseStore(value: unknown): Store {
    const data = record(value);
    if (typeof data.id !== "number" || !Number.isSafeInteger(data.id) || data.id < 0) throw new Error("O core retornou um identificador de filial inválido.");
    const store: Store = {
        id: String(data.id), name: text(data.name, STORE_MAX_LENGTH.name),
        cnpj: text(data.cnpj, STORE_MAX_LENGTH.cnpj), city: text(data.city, STORE_MAX_LENGTH.city),
        state: text(data.state, STORE_MAX_LENGTH.state).toUpperCase(),
        street: text(data.street, STORE_MAX_LENGTH.street), number: text(data.number, STORE_MAX_LENGTH.number),
        neighborhood: text(data.neighborhood, STORE_MAX_LENGTH.neighborhood),
        storeImageUrl: parseStoreImageUrl(data.storeImageUrl),
        openingTime: text(data.openingTime, 5, true), closingTime: text(data.closingTime, 5, true),
    };
    if (!store.name || !/^\d{14}$/u.test(store.cnpj.replace(/\D/gu, "")) || !BRAZILIAN_STATES.includes(store.state)) throw new Error("O core retornou dados de identificação de filial inválidos.");
    if ([store.openingTime, store.closingTime].some((time) => time && !isStoreTime(time))) throw new Error("O core retornou um horário de filial inválido.");
    // O contrato de leitura não garante CEP/telefones. Aproveita-os somente se presentes.
    if (data.cep != null) {
        store.cep = text(data.cep, STORE_MAX_LENGTH.cep);
        if (!/^\d{8}$/u.test(store.cep.replace(/\D/gu, ""))) throw new Error("O core retornou um CEP inválido.");
    }
    if (data.phones != null) {
        if (!Array.isArray(data.phones) || data.phones.length > 10) throw new Error("O core retornou telefones inválidos.");
        store.phones = data.phones.map((phone) => {
            const result = text(phone, 20).replace(/\D/gu, "");
            if (!/^[1-9]\d{9,10}$/u.test(result)) throw new Error("O core retornou um telefone inválido.");
            return result;
        });
    }
    return store;
}

export function parseStores(value: unknown): Store[] {
    if (!Array.isArray(value)) throw new Error("O core retornou uma lista de filiais inválida.");
    const stores = value.map(parseStore);
    if (new Set(stores.map((store) => store.id)).size !== stores.length) throw new Error("O core retornou filiais com identificadores duplicados.");
    return stores;
}

export function parseStoreImageResponse(value: unknown): StoreImageResponse {
    const data = record(value);
    if (typeof data.profileId !== "number" || !Number.isSafeInteger(data.profileId) || data.profileId < 0) throw new Error("O core retornou uma identificação de imagem inválida.");
    return { profileId: data.profileId, profileImageUrl: parseStoreImageUrl(data.profileImageUrl) };
}
