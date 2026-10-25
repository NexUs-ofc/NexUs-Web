import type { AuthTokens, LoginPayload, RefreshPayload, VerifyRegistrationPayload } from "../types/auth";
import type { RegistrationData, RegistrationStartResponse } from "../types/registration";
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

export interface RegistrationStartRequestOptions {
    signal?: AbortSignal;
}

export async function startRegistration(
    payload: RegistrationData,
    options: RegistrationStartRequestOptions = {},
): Promise<RegistrationStartResponse> {
    try {
        return await apiRequest<RegistrationStartResponse>(
            AUTH_API_BASE_URL,
            "/api/auth/registrations/password/start",
            {
                method: "POST",
                apiKey: AUTH_API_KEY,
                body: payload,
                credentials: "omit",
                ...(options.signal ? { signal: options.signal } : {}),
            },
        );
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Erro inesperado ao iniciar o cadastro.", { cause: error });
    }
}

export interface VerifyRegistrationRequestOptions {
    signal?: AbortSignal;
}

export async function verifyRegistration(
    payload: VerifyRegistrationPayload,
    options: VerifyRegistrationRequestOptions = {},
): Promise<AuthTokens> {
    try {
        return await apiRequest<AuthTokens>(AUTH_API_BASE_URL, "/api/auth/registrations/verify", {
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
        throw new Error("Erro inesperado ao verificar o cadastro.", { cause: error });
    }
}
