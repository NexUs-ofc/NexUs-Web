import type { Profile } from "../types/profile";

export const AUTH_STORAGE_VERSION = 1;

export const AUTH_STORAGE_KEY = "nexus-auth-session";

export interface PersistedAuthSession {
    _versao: number;
    profile: Profile | null;
    expiresAt: string | null;
}

function isPersistedAuthSession(value: unknown): value is PersistedAuthSession {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const record = value as Record<string, unknown>;
    return (
        record["_versao"] === AUTH_STORAGE_VERSION &&
        ("profile" in record) &&
        ("expiresAt" in record)
    );
}

export function saveAuthSession(profile: Profile | null, expiresAt: string | null): void {
    const payload: PersistedAuthSession = {
        _versao: AUTH_STORAGE_VERSION,
        profile,
        expiresAt,
    };
    try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
    } catch {
        return;
    }
}

export function loadAuthSession(): PersistedAuthSession | null {
    let raw: string | null;
    try {
        raw = localStorage.getItem(AUTH_STORAGE_KEY);
    } catch {
        return null;
    }
    if (raw === null) {
        return null;
    }
    try {
        const parsed: unknown = JSON.parse(raw);
        if (!isPersistedAuthSession(parsed)) {
            clearAuthSession();
            return null;
        }
        if (parsed.expiresAt !== null) {
            const expiresTime = Date.parse(parsed.expiresAt);
            if (Number.isNaN(expiresTime) || expiresTime <= Date.now()) {
                clearAuthSession();
                return null;
            }
        }
        return parsed;
    } catch {
        clearAuthSession();
        return null;
    }
}

export function clearAuthSession(): void {
    try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
        return;
    }
}
