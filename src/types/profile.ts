export type ProfileType = "HOUSEHOLD" | "BUSINESS" | "COMPANY" | "STORE" | "ADMIN";

export type ProfileStatus = "ACTIVE" | "INACTIVE" | "PENDING";

export interface ProfileAddress {
    street: string;
    number: string;
    neighborhood: string;
    cep: string;
    city: string;
    state: string;
}

export interface Profile {
    id: number;
    name: string;
    email: string;
    profileType: ProfileType;
    profileStatus: ProfileStatus;
    profileImageUrl: string | null;
    createdAt: string;
    phones: string[];
    address: ProfileAddress | null;
}

export interface ProfileFormData {
    name: string;
    phones: string[];
    address: ProfileAddress;
}

export interface ProfileFormErrors {
    name: string;
    phones: string[];
    address: Record<keyof ProfileAddress, string>;
}

export interface ProfileUpdateData extends ProfileFormData {
    photoFile: File | null;
    profileImageUrl: string;
}

export interface ProfileUpdatePayload {
    name: string;
    phones: string[];
    address?: ProfileAddress;
}

export interface ProfileImageResponse {
    profileId: number;
    profileImageUrl: string | null;
}
