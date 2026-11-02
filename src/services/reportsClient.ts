import { ApiError } from "./apiError";
import { apiRequest, apiRequestBlob } from "./apiClient";
import type { ApiRequestOptions } from "./apiClient";
import { withAuthSession } from "./sessionManager";

const REPORTS_API_BASE_URL: string | undefined = import.meta.env.VITE_CHATBOT_API_BASE_URL;
const REPORTS_API_KEY: string | undefined = import.meta.env.VITE_CHATBOT_API_KEY;

export type ReportsRequestOptions = Pick<ApiRequestOptions, "signal">;

function buildOptions(token: string | null, options: ReportsRequestOptions): ApiRequestOptions {
    return {
        ...(token !== null ? { authToken: token } : {}),
        credentials: "omit",
        ...(REPORTS_API_KEY ? { apiKey: REPORTS_API_KEY } : {}),
        ...(options.signal ? { signal: options.signal } : {}),
    };
}

function baseUrl(): string {
    if (!REPORTS_API_BASE_URL) {
        throw new ApiError("O serviço de relatórios não está configurado (VITE_CHATBOT_API_BASE_URL).", 0);
    }
    return REPORTS_API_BASE_URL;
}

export async function reportsRequest<T>(endpoint: string, options: ReportsRequestOptions = {}): Promise<T> {
    const url = baseUrl();
    return withAuthSession((token) => apiRequest<T>(url, endpoint, buildOptions(token, options)), options.signal, true);
}

export async function reportsRequestBlob(endpoint: string, options: ReportsRequestOptions = {}): Promise<Blob> {
    const url = baseUrl();
    return withAuthSession((token) => apiRequestBlob(url, endpoint, buildOptions(token, options)), options.signal, true);
}

export function describeReportsError(error: unknown, fallback: string): string {
    if (error instanceof ApiError) {
        if (error.status === 401) return "Sua sessão expirou. Entre novamente para continuar.";
        if (error.status === 403) return "Seu perfil não tem permissão para ver estes dados.";
        if (error.status === 404) return error.message;
        if (error.status === 0) return error.message;
        if (error.status >= 500) return "O serviço de relatórios está indisponível no momento. Tente novamente em instantes.";
        return error.message;
    }
    return fallback;
}
