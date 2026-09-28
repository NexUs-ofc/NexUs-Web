import type { Profile } from "../types/profile";
import { apiRequest } from "./apiClient";

const CORE_API_BASE_URL =
    import.meta.env.VITE_CORE_API_BASE_URL ?? "https://ceris-core.vercel.app";

const CORE_API_KEY = import.meta.env.VITE_CORE_API_KEY ?? "default";

export interface ProfileRequestOptions {
    signal?: AbortSignal;
}

export async function getProfile(options: ProfileRequestOptions = {}): Promise<Profile> {
    try {
        return await apiRequest<Profile>(CORE_API_BASE_URL, "/api/profile", {
            method: "GET",
            apiKey: CORE_API_KEY,
            ...(options.signal ? { signal: options.signal } : {}),
        });
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Erro inesperado ao carregar o perfil.", { cause: error });
    }
}
