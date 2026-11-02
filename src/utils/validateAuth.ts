import type { AuthTokens, RefreshPayload, VerifyRegistrationPayload } from "../types/auth";
import { asRecord } from "./responseParsers";

export const REGISTRATION_ID_MAX_LENGTH = 256;

export function validateRegistrationId(value: unknown): string {
    if (typeof value !== "string" || !/^[A-Za-z0-9_-]{1,256}$/u.test(value)) {
        throw new Error("Identificação do cadastro inválida. Inicie o cadastro novamente.");
    }
    return value;
}

export function validateVerification(payload: VerifyRegistrationPayload): VerifyRegistrationPayload {
    const registrationId = validateRegistrationId(payload.registrationId);
    return { registrationId, otp: validateOtp(payload.otp) };
}

export function validateOtp(value: unknown): string {
    if (typeof value !== "string" || !/^\d{6}$/u.test(value)) throw new Error("Informe os seis dígitos do código de verificação.");
    return value;
}

export function validateToken(value: unknown): string {
    if (typeof value !== "string" || !value || value.length > 16384 || /[\s\p{Cc}]/u.test(value)) {
        throw new Error("Token de autenticação inválido. Entre novamente.");
    }
    return value;
}

export function validateRefresh(payload: RefreshPayload): RefreshPayload {
    return { refreshToken: validateToken(payload.refreshToken) };
}

export function parseExpiration(value: unknown): string {
    if (typeof value !== "string" || value.length > 64 || !Number.isFinite(Date.parse(value))) {
        throw new Error("Validade da sessão inválida.");
    }
    return value;
}

export function parseAuthTokens(value: unknown): AuthTokens {
    const data = asRecord(value);
    return {
        accessToken: validateToken(data.accessToken),
        refreshToken: validateToken(data.refreshToken),
        accessTokenExpiresAt: parseExpiration(data.accessTokenExpiresAt),
        refreshTokenExpiresAt: parseExpiration(data.refreshTokenExpiresAt),
    };
}
