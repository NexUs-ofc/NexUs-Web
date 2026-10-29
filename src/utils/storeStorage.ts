import type { Store } from "../types/store";
import { BRAZILIAN_STATES, STORE_MAX_LENGTH, isStorePhotoDataUrl, sanitizeStoreData, toStoreForm } from "./validateStore";

export const STORE_STORAGE_VERSION = 1;

interface PersistedStores {
    _versao: number;
    stores: ReadonlyArray<Store>;
}

function storageKey(profileId: number): string {
    return `nexus-stores-${profileId}`;
}

function isStore(value: unknown): value is Store {
    if (typeof value !== "object" || value === null) return false;
    const record = value as Record<string, unknown>;
    if (typeof record.id !== "string" || record.id.trim() === "") return false;
    for (const field of ["name", "city", "state"] as const) {
        if (typeof record[field] !== "string" || record[field].length > STORE_MAX_LENGTH[field]) return false;
    }
    if (!(record.name as string).trim() || (record.state !== "" && !BRAZILIAN_STATES.includes(record.state as string))) return false;
    for (const field of ["cnpj", "cep", "phone", "address", "email", "openingHours", "manager", "photoDataUrl"] as const) {
        if (record[field] !== undefined && (typeof record[field] !== "string" || record[field].length > STORE_MAX_LENGTH[field])) return false;
    }
    if (typeof record.photoDataUrl === "string" && record.photoDataUrl !== "" && !isStorePhotoDataUrl(record.photoDataUrl)) return false;
    return true;
}

export function loadStores(profileId: number): Store[] | null {
    const key = storageKey(profileId);
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    let parsed: unknown;
    try { parsed = JSON.parse(raw); } catch { localStorage.removeItem(key); return null; }
    if (typeof parsed !== "object" || parsed === null) { localStorage.removeItem(key); return null; }
    const record = parsed as Record<string, unknown>;
    if (record._versao !== STORE_STORAGE_VERSION || !Array.isArray(record.stores) || !record.stores.every(isStore)) {
        localStorage.removeItem(key);
        return null;
    }
    const stores = record.stores as Store[];
    if (new Set(stores.map((store) => store.id)).size !== stores.length) { localStorage.removeItem(key); return null; }
    // Reconstrói apenas os campos conhecidos; o conteúdo continua sendo texto renderizado por JSX.
    return stores.map((store) => ({ id: store.id, ...sanitizeStoreData(toStoreForm(store)) }));
}

export function saveStores(profileId: number, stores: ReadonlyArray<Store>): void {
    const payload: PersistedStores = { _versao: STORE_STORAGE_VERSION, stores };
    localStorage.setItem(storageKey(profileId), JSON.stringify(payload));
}
