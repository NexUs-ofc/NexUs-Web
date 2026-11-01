import type { Profile, ProfileImageResponse, ProfileUpdatePayload } from "../types/profile";
import { coreRequest } from "./coreClient";

export interface ProfileRequestOptions {
    signal?: AbortSignal;
}

export async function updateProfile(payload: ProfileUpdatePayload, options: ProfileRequestOptions = {}): Promise<Profile> {
    return coreRequest<Profile>("/api/profile", {
        method: "PATCH",
        body: payload,
        ...(options.signal ? { signal: options.signal } : {}),
    });
}

export async function uploadProfileImage(file: File, options: ProfileRequestOptions = {}): Promise<ProfileImageResponse> {
    const body = new FormData();
    body.append("file", file);
    return coreRequest<ProfileImageResponse>("/api/profile/image", {
        method: "PUT", body,
        ...(options.signal ? { signal: options.signal } : {}),
    });
}

export async function removeProfileImage(options: ProfileRequestOptions = {}): Promise<ProfileImageResponse> {
    return coreRequest<ProfileImageResponse>("/api/profile/image", {
        method: "DELETE",
        ...(options.signal ? { signal: options.signal } : {}),
    });
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
