import { apiRequest } from "./apiClient";
import type { ApiRequestOptions } from "./apiClient";

const CORE_API_BASE_URL =
    import.meta.env.VITE_CORE_API_BASE_URL ?? "https://ceris-core.vercel.app";

let coreAuthToken: string | null = null;

export function setCoreAuthToken(token: string | null): void {
    coreAuthToken = token;
}

export function getCoreAuthToken(): string | null {
    return coreAuthToken;
}

export type CoreRequestOptions = Omit<ApiRequestOptions, "authToken" | "apiKey">;

export async function coreRequest<T>(
    endpoint: string,
    options: CoreRequestOptions = {},
): Promise<T> {
    try {
        return await apiRequest<T>(CORE_API_BASE_URL, endpoint, {
            ...options,
            ...(coreAuthToken !== null ? { authToken: coreAuthToken } : {}),
            credentials: "include",
        });
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Erro inesperado na comunicação com o core.", { cause: error });
    }
}
