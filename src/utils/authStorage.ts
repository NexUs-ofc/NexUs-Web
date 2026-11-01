import { parseProfile } from "./parseProfile";
import { validateToken, parseExpiration } from "./validateAuth";
import type { Profile } from "../types/profile";

export const AUTH_STORAGE_VERSION = 3;

export const AUTH_STORAGE_KEY = "nexus-auth-session";

export interface PersistedAuthSession {
    _versao: number;
    profile: Profile | null;
    accessToken: string | null;
    expiresAt: string | null;
    refreshToken: string | null;
    refreshExpiresAt: string | null;
}

function isPersistedAuthSession(value: unknown): value is PersistedAuthSession {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const record = value as Record<string, unknown>;
    try {
        if (record["_versao"] !== AUTH_STORAGE_VERSION) return false;
        if (record.profile !== null) parseProfile(record.profile);
        for (const field of ["accessToken", "refreshToken"]) {
            if (record[field] !== null) validateToken(record[field]);
        }
        for (const field of ["expiresAt", "refreshExpiresAt"]) {
            if (record[field] !== null) parseExpiration(record[field]);
        }
        return true;
    } catch { return false; }
}

export interface SaveAuthSessionInput {
    profile: Profile | null;
    accessToken: string | null;
    expiresAt: string | null;
    refreshToken: string | null;
    refreshExpiresAt: string | null;
}

export function saveAuthSession(input: SaveAuthSessionInput): void {
    const payload: PersistedAuthSession = {
        _versao: AUTH_STORAGE_VERSION,
        profile: input.profile,
        accessToken: input.accessToken,
        expiresAt: input.expiresAt,
        refreshToken: input.refreshToken,
        refreshExpiresAt: input.refreshExpiresAt,
    };
    try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
    } catch {
        return;
    }
}

export function isExpiredAt(value: string | null): boolean {
    if (value === null) {
        return true;
    }
    const time = Date.parse(value);
    return Number.isNaN(time) || time <= Date.now();
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
        const validated = { ...parsed, profile: parsed.profile === null ? null : parseProfile(parsed.profile) };
        if (parsed.refreshToken === null || isExpiredAt(parsed.refreshExpiresAt)) {
            if (isExpiredAt(parsed.expiresAt)) {
                clearAuthSession();
                return null;
            }
            return { ...validated, refreshToken: null, refreshExpiresAt: null };
        }
        return validated;
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
