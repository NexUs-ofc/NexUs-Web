import { REGISTRATION_MAX_LENGTH } from "../types/registration";
import type { RegistrationData, RegistrationErrors } from "../types/registration";

export interface RegistrationFormData {
    name: string;
    cnpj: string;
    email: string;
    phone: string;
    password: string;
    passwordConfirmation: string;
}

export interface RegistrationFormErrors {
    name: string;
    cnpj: string;
    email: string;
    phone: string;
    password: string;
    passwordConfirmation: string;
}

export interface SanitizedRegistrationData {
    email: string;
    password: string;
    name: string;
    cnpj: string;
    planId: number;
}

type RegistrationSanitizableFields = Pick<
    RegistrationData,
    "email" | "password" | "name" | "cnpj" | "planId"
>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CNPJ_PATTERN = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
const PHONE_DIGITS_LENGTH = 11;

function sanitizeField(value: string, maxLength: number): string {
    return value.trim().slice(0, maxLength);
}

function sanitizePhone(value: string): string {
    return value.replace(/\D/g, "");
}

export function sanitizeRegistrationData(data: RegistrationSanitizableFields): SanitizedRegistrationData {
    return {
        email: sanitizeField(data.email, REGISTRATION_MAX_LENGTH.email).toLowerCase(),
        password: data.password.slice(0, REGISTRATION_MAX_LENGTH.password),
        name: sanitizeField(data.name, REGISTRATION_MAX_LENGTH.name),
        cnpj: sanitizeField(data.cnpj, REGISTRATION_MAX_LENGTH.cnpj),
        planId: data.planId,
    };
}

export function validateEmail(email: string): string {
    if (email.length === 0) {
        return "Informe o e-mail corporativo.";
    }
    if (email.length > REGISTRATION_MAX_LENGTH.email) {
        return `O e-mail deve ter no máximo ${REGISTRATION_MAX_LENGTH.email} caracteres.`;
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
    if (password.length > REGISTRATION_MAX_LENGTH.password) {
        return `A senha deve ter no máximo ${REGISTRATION_MAX_LENGTH.password} caracteres.`;
    }
    return "";
}

export function validatePasswordConfirmation(password: string, passwordConfirmation: string): string {
    if (passwordConfirmation.length === 0) {
        return "Confirme a senha de acesso.";
    }
    if (passwordConfirmation !== password) {
        return "As senhas não coincidem.";
    }
    return "";
}

export function validateName(name: string): string {
    const trimmed = name.trim();
    if (trimmed.length === 0) {
        return "Informe o nome da empresa.";
    }
    if (trimmed.length > REGISTRATION_MAX_LENGTH.name) {
        return `O nome deve ter no máximo ${REGISTRATION_MAX_LENGTH.name} caracteres.`;
    }
    return "";
}

export function validateCnpj(cnpj: string): string {
    if (cnpj.length === 0) {
        return "Informe o CNPJ.";
    }
    if (!CNPJ_PATTERN.test(cnpj)) {
        return "Informe um CNPJ válido, como 00.000.000/0001-00.";
    }
    return "";
}

export function validatePhone(phone: string): string {
    if (phone.length === 0) {
        return "Informe o telefone de contato.";
    }
    if (sanitizePhone(phone).length !== PHONE_DIGITS_LENGTH) {
        return "Informe um telefone válido com DDD, como (11) 99999-9999.";
    }
    return "";
}

export function validatePhones(phones: string[]): string {
    if (phones.length === 0) {
        return "Informe o telefone de contato.";
    }
    for (const phone of phones) {
        const phoneError = validatePhone(phone);
        if (phoneError !== "") {
            return phoneError;
        }
    }
    return "";
}

export function validatePlanId(planId: number): string {
    if (!Number.isSafeInteger(planId) || planId < 1) {
        return "Selecione um plano antes de continuar.";
    }
    return "";
}

export function validateRegistrationFormData(data: RegistrationFormData): RegistrationFormErrors {
    return {
        name: validateName(data.name),
        cnpj: validateCnpj(data.cnpj),
        email: validateEmail(data.email),
        phone: validatePhone(data.phone),
        password: validatePassword(data.password),
        passwordConfirmation: validatePasswordConfirmation(data.password, data.passwordConfirmation),
    };
}

export function isRegistrationFormDataValid(errors: RegistrationFormErrors): boolean {
    return (
        errors.name === "" &&
        errors.cnpj === "" &&
        errors.email === "" &&
        errors.phone === "" &&
        errors.password === "" &&
        errors.passwordConfirmation === ""
    );
}

export function validateRegistrationForm(data: RegistrationData): RegistrationErrors {
    const sanitized = sanitizeRegistrationData(data);
    return {
        type: "",
        email: validateEmail(sanitized.email),
        password: validatePassword(sanitized.password),
        name: validateName(sanitized.name),
        phones: validatePhones(data.phones),
        cnpj: validateCnpj(sanitized.cnpj),
        planId: validatePlanId(data.planId),
    };
}

export function isRegistrationFormValid(errors: RegistrationErrors): boolean {
    return (
        errors.email === "" &&
        errors.password === "" &&
        errors.name === "" &&
        errors.phones === "" &&
        errors.cnpj === "" &&
        errors.planId === ""
    );
}

export function toRegistrationDraft(data: RegistrationFormData): RegistrationData {
    const sanitized = sanitizeRegistrationData({
        email: data.email,
        password: data.password,
        name: data.name,
        cnpj: data.cnpj,
        planId: -1,
    });
    return {
        type: "COMPANY",
        email: sanitized.email,
        password: sanitized.password,
        name: sanitized.name,
        phones: [sanitizePhone(data.phone)],
        cnpj: sanitized.cnpj,
        planId: -1,
    };
}

export function toRegistrationPayload(data: RegistrationData): RegistrationData {
    const sanitized = sanitizeRegistrationData(data);
    return {
        type: "COMPANY",
        email: sanitized.email,
        password: sanitized.password,
        name: sanitized.name,
        phones: data.phones.map((phone) => `+${sanitizePhone(phone)}`),
        cnpj: sanitizePhone(sanitized.cnpj),
        planId: data.planId,
    };
}
