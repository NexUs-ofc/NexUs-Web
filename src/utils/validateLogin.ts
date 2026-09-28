import type { LoginPayload } from "../types/auth";

export interface LoginFormData {
    email: string;
    password: string;
}

export interface LoginFormErrors {
    email: string;
    password: string;
}

export const LOGIN_MAX_LENGTH = {
    email: 254,
    password: 128,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeField(value: string, maxLength: number): string {
    return value.trim().slice(0, maxLength);
}

export function sanitizeLoginForm(data: LoginFormData): LoginFormData {
    return {
        email: sanitizeField(data.email, LOGIN_MAX_LENGTH.email).toLowerCase(),
        password: data.password.slice(0, LOGIN_MAX_LENGTH.password),
    };
}

export function validateEmail(email: string): string {
    if (email.length === 0) {
        return "Informe o e-mail corporativo.";
    }
    if (email.length > LOGIN_MAX_LENGTH.email) {
        return `O e-mail deve ter no máximo ${LOGIN_MAX_LENGTH.email} caracteres.`;
    }
    if (!EMAIL_PATTERN.test(email)) {
        return "Informe um e-mail válido, como exemplo@empresa.com.";
    }
    return "";
}

export function validatePassword(password: string): string {
    if (password.length === 0) {
        return "Informe a senha de acesso.";
    }
    if (password.length < 6) {
        return "A senha deve ter no mínimo 6 caracteres.";
    }
    if (password.length > LOGIN_MAX_LENGTH.password) {
        return `A senha deve ter no máximo ${LOGIN_MAX_LENGTH.password} caracteres.`;
    }
    return "";
}

export function validateLoginForm(data: LoginFormData): LoginFormErrors {
    const sanitized = sanitizeLoginForm(data);
    return {
        email: validateEmail(sanitized.email),
        password: validatePassword(sanitized.password),
    };
}

export function isLoginFormValid(errors: LoginFormErrors): boolean {
    return errors.email === "" && errors.password === "";
}

export function toLoginPayload(data: LoginFormData): LoginPayload {
    const sanitized = sanitizeLoginForm(data);
    return {
        email: sanitized.email,
        password: sanitized.password,
        channel: "PLATFORM",
    };
}
