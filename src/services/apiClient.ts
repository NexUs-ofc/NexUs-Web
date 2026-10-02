import { ApiError } from "./apiError";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface ApiRequestOptions {
    method?: HttpMethod;
    apiKey?: string;
    authToken?: string;
    body?: unknown;
    signal?: AbortSignal;
    credentials?: RequestCredentials;
}

function resolveErrorMessage(data: unknown, fallback: string): string {
    if (typeof data === "object" && data !== null && "message" in data) {
        const message = (data as Record<string, unknown>)["message"];
        if (typeof message === "string" && message.length > 0) {
            return message;
        }
    }
    return fallback;
}

export async function apiRequest<T>(
    baseUrl: string,
    endpoint: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const url = `${normalizedBase}${endpoint}`;
    try {
        const response = await fetch(url, {
            method: options.method ?? "GET",
            credentials: options.credentials ?? "include",
            headers: {
                "Content-Type": "application/json",
                ...(options.apiKey ? { "X-API-KEY": options.apiKey } : {}),
                ...(options.authToken ? { Authorization: `Bearer ${options.authToken}` } : {}),
            },
            ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
            ...(options.signal ? { signal: options.signal } : {}),
        });
        let data: unknown = null;
        try {
            data = await response.json();
        } catch {
            data = null;
        }
        if (!response.ok) {
            throw new ApiError(resolveErrorMessage(data, "Erro ao comunicar com o servidor."), response.status);
        }
        return data as T;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new ApiError("Operação cancelada.", 0);
        }
        throw new ApiError("Não foi possível conectar ao servidor.", 0);
    }
}
