import type { RegistrationData } from "../types/registration";

export const REGISTRATION_STORAGE_VERSION = 1;

export const REGISTRATION_STORAGE_KEY = "nexus-registration-draft";

export interface PersistedRegistrationDraft {
    _versao: number;
    data: RegistrationData;
}

function isPersistedRegistrationDraft(value: unknown): value is PersistedRegistrationDraft {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const record = value as Record<string, unknown>;
    return (
        record["_versao"] === REGISTRATION_STORAGE_VERSION &&
        ("data" in record)
    );
}

export function saveRegistrationDraft(data: RegistrationData): void {
    const payload: PersistedRegistrationDraft = {
        _versao: REGISTRATION_STORAGE_VERSION,
        data,
    };
    try {
        localStorage.setItem(REGISTRATION_STORAGE_KEY, JSON.stringify(payload));
    } catch {
        return;
    }
}

export function loadRegistrationDraft(): RegistrationData | null {
    let raw: string | null;
    try {
        raw = localStorage.getItem(REGISTRATION_STORAGE_KEY);
    } catch {
        return null;
    }
    if (raw === null) {
        return null;
    }
    try {
        const parsed: unknown = JSON.parse(raw);
        if (!isPersistedRegistrationDraft(parsed)) {
            clearRegistrationDraft();
            return null;
        }
        return parsed.data;
    } catch {
        clearRegistrationDraft();
        return null;
    }
}

export function clearRegistrationDraft(): void {
    try {
        localStorage.removeItem(REGISTRATION_STORAGE_KEY);
    } catch {
        return;
    }
}
