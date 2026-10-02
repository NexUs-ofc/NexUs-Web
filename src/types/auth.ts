export type AuthChannel = "PLATFORM";

export interface LoginPayload {
    email: string;
    password: string;
    channel: AuthChannel;
}

export interface AuthTokens {
    accessToken: string;
    accessTokenExpiresAt: string;
    refreshToken: string;
    refreshTokenExpiresAt: string;
}

export interface RefreshPayload {
    refreshToken: string;
}

export type AuthStatus = "idle" | "loading" | "authenticated" | "error";
