import { ApiError } from "./apiError";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiRequestOptions {
    method?: HttpMethod;
    apiKey?: string;
    authToken?: string;
    body?: unknown;
    signal?: AbortSignal;
    timeoutMs?: number;
    credentials?: RequestCredentials;
}

function resolveErrorMessage(data: unknown, fallback: string): string {
    if (typeof data === "object" && data !== null) {
        const record = data as Record<string, unknown>;
        // `message` (APIs do NexUs) ou `detail` (FastAPI do gerador de relatórios).
        for (const key of ["message", "detail"]) {
            const value = record[key];
            if (typeof value === "string" && value.length > 0) {
                return value;
            }
        }
    }
    return fallback;
}

function buildHeaders(options: ApiRequestOptions, accept?: string): Record<string, string> {
    return {
        ...(accept ? { Accept: accept } : { "Content-Type": "application/json" }),
        ...(options.apiKey ? { "X-API-KEY": options.apiKey } : {}),
        ...(options.authToken ? { Authorization: `Bearer ${options.authToken}` } : {}),
    };
}

/** Baixa um arquivo binário (ex.: PDF). Erros HTTP continuam chegando como ApiError com a mensagem da API. */
export async function apiRequestBlob(
    baseUrl: string,
    endpoint: string,
    options: ApiRequestOptions = {},
): Promise<Blob> {
    const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const timeout = AbortSignal.timeout(options.timeoutMs ?? 30_000);
    const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
    try {
        const response = await fetch(`${normalizedBase}${endpoint}`, {
            method: options.method ?? "GET",
            credentials: options.credentials ?? "include",
            headers: buildHeaders(options, "application/pdf, application/json"),
            signal,
        });
        if (!response.ok) {
            let data: unknown = null;
            try {
                data = await response.json();
            } catch {
                data = null;
            }
            signal.throwIfAborted();
            throw new ApiError(resolveErrorMessage(data, "Erro ao comunicar com o servidor."), response.status);
        }
        const blob = await response.blob();
        signal.throwIfAborted();
        return blob;
    } catch (error) {
        if (options.signal?.aborted) throw new ApiError("Operação cancelada.", 0);
        if (timeout.aborted) throw new ApiError("O servidor demorou para responder. Confira se a operação foi concluída antes de tentar novamente.", 0);
        if (error instanceof ApiError) {
            throw error;
        }
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new ApiError("Operação cancelada.", 0);
        }
        throw new ApiError("Não foi possível conectar ao servidor.", 0);
    }
}

export async function apiRequest<T>(
    baseUrl: string,
    endpoint: string,
    options: ApiRequestOptions = {},
): Promise<T> {
    const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    const url = `${normalizedBase}${endpoint}`;
    const multipart = options.body instanceof FormData;
    const timeout = AbortSignal.timeout(options.timeoutMs ?? 30_000);
    const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
    try {
        const response = await fetch(url, {
            method: options.method ?? "GET",
            credentials: options.credentials ?? "include",
            headers: {
                ...(!multipart && options.body !== undefined ? { "Content-Type": "application/json" } : {}),
                ...(options.apiKey ? { "X-API-KEY": options.apiKey } : {}),
                ...(options.authToken ? { Authorization: `Bearer ${options.authToken}` } : {}),
            },
            ...(options.body !== undefined ? { body: multipart ? options.body as FormData : JSON.stringify(options.body) } : {}),
            signal,
        });
        let data: unknown = null;
        try {
            data = await response.json();
        } catch {
            data = null;
        }
        signal.throwIfAborted();
        if (!response.ok) {
            throw new ApiError(resolveErrorMessage(data, "Erro ao comunicar com o servidor."), response.status);
        }
        return data as T;
    } catch (error) {
        if (options.signal?.aborted) throw new ApiError("Operação cancelada.", 0);
        if (timeout.aborted) throw new ApiError("O servidor demorou para responder. Confira se a operação foi concluída antes de tentar novamente.", 0);
        if (error instanceof ApiError) {
            throw error;
        }
        if (error instanceof DOMException && error.name === "AbortError") {
            throw new ApiError("Operação cancelada.", 0);
        }
        throw new ApiError("Não foi possível conectar ao servidor.", 0);
    }
}
