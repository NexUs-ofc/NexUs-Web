import { validateProfilePhoto } from "../utils/profilePhoto";
import { parseProfile, parseProfileImage } from "../utils/parseProfile";
import type { Profile, ProfileImageResponse, ProfileUpdatePayload } from "../types/profile";
import { coreRequest } from "./coreClient";

export interface ProfileRequestOptions {
    signal?: AbortSignal;
}

export async function updateProfile(payload: ProfileUpdatePayload, options: ProfileRequestOptions = {}): Promise<Profile> {
    return parseProfile(await coreRequest<unknown>("/api/profile", {
        method: "PATCH",
        body: payload,
        ...(options.signal ? { signal: options.signal } : {}),
    }));
}

export async function uploadProfileImage(file: File, options: ProfileRequestOptions = {}): Promise<ProfileImageResponse> {
    await validateProfilePhoto(file, options.signal ?? new AbortController().signal);
    const body = new FormData();
    body.append("file", file);
    return parseProfileImage(await coreRequest<unknown>("/api/profile/image", {
        method: "PUT", body,
        ...(options.signal ? { signal: options.signal } : {}),
    }));
}

export async function removeProfileImage(options: ProfileRequestOptions = {}): Promise<ProfileImageResponse> {
    return parseProfileImage(await coreRequest<unknown>("/api/profile/image", {
        method: "DELETE",
        ...(options.signal ? { signal: options.signal } : {}),
    }));
}

export async function getProfile(options: ProfileRequestOptions = {}): Promise<Profile> {
    try {
        return parseProfile(await coreRequest<unknown>("/api/profile", {
            method: "GET",
            ...(options.signal ? { signal: options.signal } : {}),
        }));
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Erro inesperado ao carregar o perfil.", { cause: error });
    }
}
