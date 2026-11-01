export type RegistrationType = "COMPANY";

export interface RegistrationData {
    type: RegistrationType;
    email: string;
    password: string;
    name: string;
    phones: string[];
    cnpj: string;
    planId: number;
}

export interface RegistrationErrors {
    type: string;
    email: string;
    password: string;
    name: string;
    phones: string;
    cnpj: string;
    planId: string;
}

export const REGISTRATION_MAX_LENGTH = {
    email: 254,
    password: 128,
    name: 100,
    cnpj: 18,
    phone: 15,
} as const;

export const REGISTRATION_INITIAL_DATA: RegistrationData = {
    type: "COMPANY",
    email: "",
    password: "",
    name: "",
    phones: [],
    cnpj: "",
    planId: -1,
};

export const REGISTRATION_INITIAL_ERRORS: RegistrationErrors = {
    type: "",
    email: "",
    password: "",
    name: "",
    phones: "",
    cnpj: "",
    planId: "",
};

export interface RegistrationStartResponse {
    registrationId: string;
}
