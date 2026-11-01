import type { RegistrationData } from "../types/registration";
import { validateRegistrationId } from "./validateAuth";

export const REGISTRATION_STORAGE_KEY = "nexus-registration-draft";
let draft: RegistrationData | null = null;

function removeLegacyDraft(): void {
    try { localStorage.removeItem(REGISTRATION_STORAGE_KEY); } catch { /* Storage indisponível. */ }
}

export function saveRegistrationDraft(data: RegistrationData): void {
    removeLegacyDraft();
    draft = { ...data, phones: [...data.phones] };
}

export function loadRegistrationDraft(): RegistrationData | null {
    removeLegacyDraft();
    return draft ? { ...draft, phones: [...draft.phones] } : null;
}

export function clearRegistrationDraft(): void {
    draft = null;
    removeLegacyDraft();
}

export const REGISTRATION_ID_STORAGE_VERSION = 1;

export const REGISTRATION_ID_STORAGE_KEY = "nexus-registration-id";

export interface PersistedRegistrationId {
    _versao: number;
    registrationId: string;
}

function isPersistedRegistrationId(value: unknown): value is PersistedRegistrationId {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const record = value as Record<string, unknown>;
    return (
        record["_versao"] === REGISTRATION_ID_STORAGE_VERSION &&
        typeof record["registrationId"] === "string" &&
        record["registrationId"].length > 0 &&
        record["registrationId"].length <= 256 && /^[A-Za-z0-9_-]+$/u.test(record["registrationId"])
    );
}

export function saveRegistrationId(registrationId: string): void {
    const payload: PersistedRegistrationId = {
        _versao: REGISTRATION_ID_STORAGE_VERSION,
        registrationId: validateRegistrationId(registrationId),
    };
    try {
        localStorage.setItem(REGISTRATION_ID_STORAGE_KEY, JSON.stringify(payload));
    } catch {
        return;
    }
}

export function loadRegistrationId(): string | null {
    let raw: string | null;
    try {
        raw = localStorage.getItem(REGISTRATION_ID_STORAGE_KEY);
    } catch {
        return null;
    }
    if (raw === null) {
        return null;
    }
    try {
        const parsed: unknown = JSON.parse(raw);
        if (!isPersistedRegistrationId(parsed)) {
            clearRegistrationId();
            return null;
        }
        return parsed.registrationId;
    } catch {
        clearRegistrationId();
        return null;
    }
}

export function clearRegistrationId(): void {
    try {
        localStorage.removeItem(REGISTRATION_ID_STORAGE_KEY);
    } catch {
        return;
    }
}
