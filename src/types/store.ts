export interface Store {
    id: string;
    name: string;
    city: string;
    state: string;
    cnpj: string;
    street: string;
    number: string;
    neighborhood: string;
    openingTime: string;
    closingTime: string;
    storeImageUrl: string;
    cep?: string;
    phones?: string[];
}

export type StoreFormMode = "create" | "edit";

export interface StoreFormData {
    name: string;
    cnpj: string;
    cep: string;
    phone: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    email: string;
    openingTime: string;
    closingTime: string;
    photoDataUrl: string;
}

export interface StorePayload {
    cnpj: string;
    name: string;
    phones?: string[];
    address: {
        neighborhood: string;
        street: string;
        number: string;
        cep?: string;
        city: string;
        state: string;
    };
    openingTime?: string;
    closingTime?: string;
}

export interface CreateStorePayload extends StorePayload { email: string; }

export interface StoreImageResponse {
    profileId: number;
    profileImageUrl: string;
}

export type StoreFormErrors = Record<keyof StoreFormData, string>;

export type StoreDialogState = { kind: "closed" } | { kind: "edit" | "delete"; store: Store };

export interface StoreFilters {
    search: string;
    city: string;
    state: string;
}

export interface StoreLocation {
    value: string;
    label: string;
}
