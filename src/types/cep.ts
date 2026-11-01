export interface CepAddress {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
}

export interface CepLookupState {
    loading: boolean;
    error: string;
    message: string;
}
