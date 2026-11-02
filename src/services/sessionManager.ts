import type { Profile } from "../types/profile";
import { AUTH_STORAGE_KEY, clearAuthSession, isExpiredAt, loadAuthSession, saveAuthSession } from "../utils/authStorage";
import type { SaveAuthSessionInput } from "../utils/authStorage";
import { ApiError } from "./apiError";
import { refreshSession } from "./auth.service";

export const REFRESH_MARGIN_MS = 30_000;
type Session = SaveAuthSessionInput | null;
let session: Session = null;
let initialized = false;
let storageBacked = false;
let revision = 0;
let pending: { revision: number; promise: Promise<string | null> } | null = null;
const listeners = new Set<(value: Session) => void>();

export function getAuthSession(): Session {
    return session;
}

function publish(value: Session, persist: boolean): void {
    if (session?.accessToken !== value?.accessToken || session?.refreshToken !== value?.refreshToken || session?.profile?.id !== value?.profile?.id) {
        revision += 1;
    }
    session = value;
    if (persist) {
        if (value === null) {
            clearAuthSession();
            storageBacked = false;
        } else storageBacked = saveAuthSession(value);
    } else {
        storageBacked = value !== null;
    }
    for (const listener of listeners) listener(value);
}

export function setAuthSession(value: Session): void {
    initialized = true;
    publish(value, true);
}

export function restoreAuthSession(): Session {
    if (!initialized) {
        initialized = true;
        publish(loadAuthSession(), false);
    }
    return session;
}

export function subscribeAuthSession(listener: (value: Session) => void): () => void {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}

export function updateSessionProfile(profile: Profile): void {
    if (session?.profile?.id === profile.id) setAuthSession({ ...session, profile });
}

function needsRefresh(value: SaveAuthSessionInput): boolean {
    const deadline = value.expiresAt === null ? NaN : Date.parse(value.expiresAt);
    return value.accessToken === null || !Number.isFinite(deadline) || deadline <= Date.now() + REFRESH_MARGIN_MS;
}

function expiredSession(): ApiError {
    return new ApiError("Sua sessão expirou. Entre novamente para continuar.", 401);
}

export async function getSessionAccessToken(rejectedToken?: string): Promise<string | null> {
    if (session === null) return null;
    if (pending?.revision === revision) return pending.promise;
    if (rejectedToken !== undefined && session.accessToken !== rejectedToken) return session.accessToken;
    if (rejectedToken === undefined && !needsRefresh(session)) return session.accessToken;
    if (session.refreshToken === null || isExpiredAt(session.refreshExpiresAt)) {
        if (rejectedToken === undefined && session.accessToken !== null && !isExpiredAt(session.expiresAt)) {
            return session.accessToken;
        }
        setAuthSession(null);
        throw expiredSession();
    }

    const startRevision = revision;
    const original = session;
    const rotate = async (): Promise<string | null> => {
        let expectedRevision = startRevision;
        let refreshBase = original;
        if (revision !== startRevision) {
            if (session === null || session.profile?.id !== original.profile?.id) throw new ApiError("A sessão foi alterada. Tente novamente.", 0);
            if (!needsRefresh(session)) return session.accessToken;
            expectedRevision = revision;
            refreshBase = session;
            if (pending) pending.revision = revision;
        }

        const stored = storageBacked ? loadAuthSession() : null;
        if (stored === null && storageBacked) {
            let removed: boolean;
            try { removed = localStorage.getItem(AUTH_STORAGE_KEY) === null; } catch { removed = false; }
            if (removed) {
                setAuthSession(null);
                throw expiredSession();
            }
        }
        if (stored !== null && stored.refreshToken !== refreshBase.refreshToken) {
            publish(stored, false);
            if (stored.profile?.id !== original.profile?.id) throw new ApiError("A sessão foi alterada. Tente novamente.", 0);
            if (!needsRefresh(stored)) return stored.accessToken;
            expectedRevision = revision;
            refreshBase = stored;
            if (pending) pending.revision = revision;
        }
        if (refreshBase.refreshToken === null || isExpiredAt(refreshBase.refreshExpiresAt)) {
            setAuthSession(null);
            throw expiredSession();
        }

        try {
            const tokens = await refreshSession({ refreshToken: refreshBase.refreshToken });
            if (revision !== expectedRevision) throw new ApiError("A sessão foi alterada. Tente novamente.", 0);
            setAuthSession({
                ...refreshBase,
                profile: session?.profile ?? refreshBase.profile,
                accessToken: tokens.accessToken,
                expiresAt: tokens.accessTokenExpiresAt,
                refreshToken: tokens.refreshToken,
                refreshExpiresAt: tokens.refreshTokenExpiresAt,
            });
            return tokens.accessToken;
        } catch (error) {
            if (revision === expectedRevision && error instanceof ApiError && error.status === 401) setAuthSession(null);
            throw error;
        }
    };

    const promise = Promise.resolve().then(() => typeof navigator !== "undefined" && navigator.locks
        ? navigator.locks.request("nexus-auth-refresh", rotate)
        : rotate()).finally(() => {
        if (pending?.promise === promise) pending = null;
    });
    pending = { revision: startRevision, promise };
    return promise;
}

function checkAborted(signal?: AbortSignal): void {
    if (signal?.aborted) throw new ApiError("Operação cancelada.", 0);
}

export async function withAuthSession<T>(
    request: (token: string | null) => Promise<T>,
    signal?: AbortSignal,
    required = false,
): Promise<T> {
    checkAborted(signal);
    const requestProfileId = session?.profile?.id;
    const token = await getSessionAccessToken();
    checkAborted(signal);
    if (token !== null && (session?.accessToken !== token || session?.profile?.id !== requestProfileId)) {
        throw new ApiError("A sessão foi alterada. Tente novamente.", 0);
    }
    if (required && token === null) throw expiredSession();
    try {
        return await request(token);
    } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401 || token === null || session === null) throw error;
        checkAborted(signal);
        if (session.profile?.id !== requestProfileId) throw error;
        const renewed = await getSessionAccessToken(token);
        checkAborted(signal);
        if (renewed === null || session?.profile?.id !== requestProfileId) throw expiredSession();
        return request(renewed);
    }
}

export function maintainAuthSession(): () => void {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    const schedule = (retry = false): void => {
        clearTimeout(timer);
        if (stopped || session === null) return;
        const expiry = session.expiresAt === null ? NaN : Date.parse(session.expiresAt);
        const margin = session.refreshToken === null || isExpiredAt(session.refreshExpiresAt) ? 0 : REFRESH_MARGIN_MS;
        const delay = retry ? REFRESH_MARGIN_MS : Math.max(1_000, (Number.isFinite(expiry) ? expiry : Date.now()) - Date.now() - margin);
        timer = setTimeout(renew, Math.min(delay, 2_147_483_647));
    };
    const renew = (): void => {
        void getSessionAccessToken().then(() => schedule(), () => schedule(true));
    };
    const onStorage = (event: StorageEvent): void => {
        if (event.key === AUTH_STORAGE_KEY || event.key === null) publish(loadAuthSession(), false);
    };
    const onVisible = (): void => { if (document.visibilityState === "visible") renew(); };
    const unsubscribe = subscribeAuthSession(() => schedule());
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", renew);
    window.addEventListener("online", renew);
    document.addEventListener("visibilitychange", onVisible);
    schedule();
    return () => {
        stopped = true;
        clearTimeout(timer);
        unsubscribe();
        window.removeEventListener("storage", onStorage);
        window.removeEventListener("focus", renew);
        window.removeEventListener("online", renew);
        document.removeEventListener("visibilitychange", onVisible);
    };
}
