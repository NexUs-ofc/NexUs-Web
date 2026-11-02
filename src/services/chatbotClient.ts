import { ApiError } from "./apiError";
import { apiRequest } from "./apiClient";
import type { ApiRequestOptions } from "./apiClient";
import { withAuthSession } from "./sessionManager";

const CHATBOT_API_BASE_URL: string | undefined = import.meta.env.VITE_CHATBOT_API_BASE_URL;
const CHATBOT_API_KEY: string | undefined = import.meta.env.VITE_CHATBOT_API_KEY;

export type ChatbotRequestOptions = Pick<ApiRequestOptions, "signal" | "method" | "body" | "timeoutMs">;

function buildAuth(token: string | null): Pick<ApiRequestOptions, "authToken" | "apiKey" | "credentials"> {
    return {
        ...(token !== null ? { authToken: token } : {}),
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
    const url = baseUrl();
    return withAuthSession((token) => apiRequest<T>(url, endpoint, {
        ...buildAuth(token),
        ...options,
    }), options.signal, true);
}

export interface DescribeApiErrorOptions {
    unavailable?: string;
    forbidden?: string;
}

const GENERIC_SERVER_ERROR = "Erro ao comunicar com o servidor.";

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
