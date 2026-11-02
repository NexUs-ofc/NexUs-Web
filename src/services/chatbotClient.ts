/**
 * Cliente HTTP do chatbot Cerita (NexUs-BI-AI / app/app.py).
 *
 * A API corre em VITE_CHATBOT_API_BASE_URL (padrão: http://localhost:8000).
 * Usa X-API-Key + Bearer JWT, sem cookies (credentials: "omit"), o mesmo
 * esquema do reportsClient. O token Bearer é o mesmo da sessão do core.
 */
import { ApiError } from "./apiError";
import { apiRequest } from "./apiClient";
import type { ApiRequestOptions } from "./apiClient";
import { getCoreAuthToken } from "./coreClient";

const CHATBOT_API_BASE_URL: string | undefined = import.meta.env.VITE_CHATBOT_API_BASE_URL;
const CHATBOT_API_KEY: string | undefined = import.meta.env.VITE_CHATBOT_API_KEY;

export type ChatbotRequestOptions = Pick<ApiRequestOptions, "signal" | "method" | "body">;

function buildAuth(): Pick<ApiRequestOptions, "authToken" | "apiKey" | "credentials"> {
    const token = getCoreAuthToken();
    if (token === null) {
        throw new ApiError("Sua sessão expirou. Entre novamente para continuar.", 401);
    }
    return {
        authToken: token,
        credentials: "omit",
        ...(CHATBOT_API_KEY ? { apiKey: CHATBOT_API_KEY } : {}),
    };
}

function baseUrl(): string {
    if (!CHATBOT_API_BASE_URL) {
        throw new ApiError("O assistente não está configurado (VITE_CHATBOT_API_BASE_URL).", 0);
    }
    return CHATBOT_API_BASE_URL;
}

export async function chatbotRequest<T>(endpoint: string, options: ChatbotRequestOptions = {}): Promise<T> {
    return apiRequest<T>(baseUrl(), endpoint, {
        ...buildAuth(),
        ...options,
    });
}

export interface DescribeApiErrorOptions {
    /** Sobrescreve a mensagem padrão para erros 5xx (indisponível). */
    unavailable?: string;
    /** Sobrescreve a mensagem padrão para 403. */
    forbidden?: string;
}

/** Mensagem que o apiClient usa quando a API não mandou `message`/`detail` no corpo do erro. */
const GENERIC_SERVER_ERROR = "Erro ao comunicar com o servidor.";

/**
 * Transforma erros da API (chatbot ou rankings) em mensagens legíveis.
 * No chat, 502/503/504 trazem do backend o motivo real (ex.: "Serviço indisponível — MongoDB: ..."),
 * que é mostrado ao usuário em vez de um "indisponível" genérico.
 */
export function describeChatbotError(
    error: unknown,
    fallback: string,
    options: DescribeApiErrorOptions = {},
): string {
    if (error instanceof ApiError) {
        const serverMessage = error.message && error.message !== GENERIC_SERVER_ERROR ? error.message : null;
        if (error.status === 401) return "Sua sessão expirou. Entre novamente para continuar.";
        if (error.status === 403) return options.forbidden ?? serverMessage ?? "Seu perfil não tem acesso ao assistente. Verifique seu tipo de acesso.";
        if (error.status === 0) return error.message;
        if (error.status >= 500) return options.unavailable ?? serverMessage ?? "O assistente está indisponível no momento. Tente novamente em instantes.";
        return error.message;
    }
    return fallback;
}
