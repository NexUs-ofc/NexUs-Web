import { parseAuthTokens, validateVerification, validateRefresh, validateRegistrationId } from "../utils/validateAuth";
import { asRecord } from "../utils/responseParsers";
import type { AuthTokens, LoginPayload, RefreshPayload, VerifyRegistrationPayload } from "../types/auth";
import type { RegistrationData, RegistrationStartResponse } from "../types/registration";
import { apiRequest } from "./apiClient";
import type { ForgotPasswordPayload, ForgotPasswordResponse, ResetPasswordPayload, VerifyPasswordResetPayload, VerifyPasswordResetResponse } from "../types/passwordRecovery";
import { parseForgotPasswordResponse, parsePasswordResetVerificationResponse, validateForgotPassword, validatePasswordReset, validatePasswordResetVerification } from "../utils/validatePasswordRecovery";

const AUTH_API_BASE_URL =
    import.meta.env.VITE_AUTH_API_BASE_URL ?? "https://ceris-auth.vercel.app";

const AUTH_API_KEY = import.meta.env.VITE_AUTH_API_KEY ?? "default";

export interface PasswordRecoveryRequestOptions {
    signal?: AbortSignal;
}

export async function forgotPassword(payload: ForgotPasswordPayload, options: PasswordRecoveryRequestOptions = {}): Promise<ForgotPasswordResponse> {
    return parseForgotPasswordResponse(await apiRequest<unknown>(AUTH_API_BASE_URL, "/api/auth/password/forgot", {
        method: "POST",
        apiKey: AUTH_API_KEY,
        body: validateForgotPassword(payload),
        credentials: "omit",
        signal: options.signal,
    }));
}

export async function verifyPasswordReset(payload: VerifyPasswordResetPayload, options: PasswordRecoveryRequestOptions = {}): Promise<VerifyPasswordResetResponse> {
    return parsePasswordResetVerificationResponse(await apiRequest<unknown>(AUTH_API_BASE_URL, "/api/auth/password/reset/verify", {
        method: "POST",
        apiKey: AUTH_API_KEY,
        body: validatePasswordResetVerification(payload),
        credentials: "omit",
        signal: options.signal,
    }));
}

export async function resetPassword(payload: ResetPasswordPayload, options: PasswordRecoveryRequestOptions = {}): Promise<void> {
    await apiRequest<unknown>(AUTH_API_BASE_URL, "/api/auth/password/reset", {
        method: "POST",
        apiKey: AUTH_API_KEY,
        body: validatePasswordReset(payload),
        credentials: "omit",
        signal: options.signal,
    });
}

export interface LoginRequestOptions {
    signal?: AbortSignal;
}

export async function login(
    payload: LoginPayload,
    options: LoginRequestOptions = {},
): Promise<AuthTokens> {
    try {
        return parseAuthTokens(await apiRequest<unknown>(AUTH_API_BASE_URL, "/api/auth/login/password", {
            method: "POST",
            apiKey: AUTH_API_KEY,
            body: payload,
            credentials: "omit",
            ...(options.signal ? { signal: options.signal } : {}),
        }));
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
        return parseAuthTokens(await apiRequest<unknown>(AUTH_API_BASE_URL, "/api/auth/token/refresh", {
            method: "POST",
            apiKey: AUTH_API_KEY,
            body: validateRefresh(payload),
            credentials: "omit",
            ...(options.signal ? { signal: options.signal } : {}),
        }));
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
        const response = await apiRequest<unknown>(
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
        return { registrationId: validateRegistrationId(asRecord(response).registrationId) };
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
        return parseAuthTokens(await apiRequest<unknown>(AUTH_API_BASE_URL, "/api/auth/registrations/verify", {
            method: "POST",
            apiKey: AUTH_API_KEY,
            body: validateVerification(payload),
            credentials: "omit",
            ...(options.signal ? { signal: options.signal } : {}),
        }));
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Erro inesperado ao verificar o cadastro.", { cause: error });
    }
}
