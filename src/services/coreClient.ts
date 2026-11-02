import { apiRequest } from "./apiClient";
import type { ApiRequestOptions } from "./apiClient";
import { withAuthSession } from "./sessionManager";

export const CORE_API_BASE_URL =
    import.meta.env.VITE_CORE_API_BASE_URL ?? "https://ceris-core.discloud.dev";

export type CoreRequestOptions = Omit<ApiRequestOptions, "apiKey">;

export async function coreRequest<T>(
    endpoint: string,
    options: CoreRequestOptions = {},
): Promise<T> {
    try {
        const request = (token: string | null) => apiRequest<T>(CORE_API_BASE_URL, endpoint, {
            ...options,
            ...(token !== null ? { authToken: token } : {}),
            credentials: "include",
        });
        return options.authToken !== undefined
            ? await request(options.authToken)
            : await withAuthSession(request, options.signal);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Erro inesperado na comunicação com o core.", { cause: error });
    }
}
