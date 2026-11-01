import type { PostalAddress } from "../types/address";
import { parsePostalAddress, validateCep } from "../utils/validateAddress";
import { apiRequest } from "./apiClient";

const VIACEP_API_BASE_URL = import.meta.env.VITE_VIACEP_API_BASE_URL ?? "https://viacep.com.br";

export interface AddressRequestOptions { signal?: AbortSignal; }

export async function getAddressByCep(cep: string, options: AddressRequestOptions = {}): Promise<PostalAddress> {
    try {
        const digits = validateCep(cep);
        const response = await apiRequest<unknown>(VIACEP_API_BASE_URL, `/ws/${digits}/json/`, {
            ...options, method: "GET", credentials: "omit",
        });
        return parsePostalAddress(response, digits);
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error("Não foi possível consultar o CEP. Tente novamente.", { cause: error });
    }
}
