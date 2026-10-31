import { ApiError } from "./apiError";
import { apiRequest, apiRequestBlob } from "./apiClient";
import type { ApiRequestOptions } from "./apiClient";
import { getCoreAuthToken } from "./coreClient";

const REPORTS_API_BASE_URL: string | undefined = import.meta.env.VITE_REPORTS_API_BASE_URL;
const REPORTS_API_KEY: string | undefined = import.meta.env.VITE_REPORTS_API_KEY;

export type ReportsRequestOptions = Pick<ApiRequestOptions, "signal">;

// A API de relatórios (NexUs-BI-AI/report_generator) exige X-API-Key + Bearer do NexUs-Auth e usa CORS
// aberto (allow_origins="*"), que o navegador só aceita sem cookies: por isso credentials = "omit".
function buildOptions(options: ReportsRequestOptions): ApiRequestOptions {
    const token = getCoreAuthToken();
    if (token === null) {
        throw new ApiError("Sua sessão expirou. Entre novamente para continuar.", 401);
    }
    return {
        authToken: token,
        credentials: "omit",
        ...(REPORTS_API_KEY ? { apiKey: REPORTS_API_KEY } : {}),
        ...(options.signal ? { signal: options.signal } : {}),
    };
}

function baseUrl(): string {
    if (!REPORTS_API_BASE_URL) {
        throw new ApiError("O serviço de relatórios não está configurado (VITE_REPORTS_API_BASE_URL).", 0);
    }
    return REPORTS_API_BASE_URL;
}

export async function reportsRequest<T>(endpoint: string, options: ReportsRequestOptions = {}): Promise<T> {
    return apiRequest<T>(baseUrl(), endpoint, buildOptions(options));
}

export async function reportsRequestBlob(endpoint: string, options: ReportsRequestOptions = {}): Promise<Blob> {
    return apiRequestBlob(baseUrl(), endpoint, buildOptions(options));
}

/** Mensagem compreensível para o usuário a partir de um erro da API de relatórios. */
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
