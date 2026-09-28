import type { AuthTokens, LoginPayload, RefreshPayload } from "../types/auth";
import { apiRequest } from "./apiClient";

const AUTH_API_BASE_URL =
    import.meta.env.VITE_AUTH_API_BASE_URL ?? "https://ceris-auth.vercel.app";

const AUTH_API_KEY = import.meta.env.VITE_AUTH_API_KEY ?? "default";

export interface LoginRequestOptions {
    signal?: AbortSignal;
}

export async function login(
    payload: LoginPayload,
    options: LoginRequestOptions = {},
): Promise<AuthTokens> {
    try {
        return await apiRequest<AuthTokens>(AUTH_API_BASE_URL, "/api/auth/login/password", {
            method: "POST",
            apiKey: AUTH_API_KEY,
            body: payload,
            credentials: "omit",
            ...(options.signal ? { signal: options.signal } : {}),
        });
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Erro inesperado ao realizar login.", { cause: error });
    }
}

export interface RefreshRequestOptions {
    signal?: AbortSignal;
}

export async function refreshSession(
    payload: RefreshPayload,
    options: RefreshRequestOptions = {},
): Promise<AuthTokens> {
    try {
        return await apiRequest<AuthTokens>(AUTH_API_BASE_URL, "/api/auth/token/refresh", {
            method: "POST",
            apiKey: AUTH_API_KEY,
            body: payload,
            credentials: "omit",
            ...(options.signal ? { signal: options.signal } : {}),
        });
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Erro inesperado ao renovar a sessão.", { cause: error });
    }
}
