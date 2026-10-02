import type { Profile } from "../types/profile";
import { coreRequest } from "./coreClient";

export interface ProfileRequestOptions {
    signal?: AbortSignal;
}

export async function getProfile(options: ProfileRequestOptions = {}): Promise<Profile> {
    try {
        return await coreRequest<Profile>("/api/profile", {
            method: "GET",
            ...(options.signal ? { signal: options.signal } : {}),
        });
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Erro inesperado ao carregar o perfil.", { cause: error });
    }
}
