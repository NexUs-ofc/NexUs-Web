export interface Store {
    id: string;
    name: string;
    city: string;
    state: string;
    cnpj?: string;
    cep?: string;
    phone?: string;
    address?: string;
    email?: string;
    openingHours?: string;
    manager?: string;
    photoDataUrl?: string;
}

export type StoreFormMode = "create" | "edit";

export interface StoreFormData {
    name: string;
    cnpj: string;
    cep: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    email: string;
    openingHours: string;
    manager: string;
    photoDataUrl: string;
}

export type StoreFormErrors = Record<keyof StoreFormData, string>;

export type StoreDialogState = { kind: "closed" } | { kind: "edit" | "delete"; store: Store };

export interface StoreFilters {
    search: string;
    location: string;
}

export interface StoreLocation {
    value: string;
    label: string;
}
