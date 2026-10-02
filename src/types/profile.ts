export type ProfileType = "HOUSEHOLD" | "BUSINESS" | "ADMIN";

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
    profileImageUrl: string;
    createdAt: string;
    phones: string[];
    address: ProfileAddress;
}
