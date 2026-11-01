export interface ForgotPasswordPayload {
    email: string;
}

export interface ForgotPasswordResponse {
    resetId: string;
}

export interface VerifyPasswordResetPayload {
    resetId: string;
    otp: string;
}

export interface VerifyPasswordResetResponse {
    resetTicket: string;
}

export interface ResetPasswordPayload {
    resetTicket: string;
    newPassword: string;
}

export type PasswordRecoveryStep =
    | { stage: "email" }
    | { stage: "verification"; resetId: string }
    | { stage: "password"; resetTicket: string }
    | { stage: "success" };

export interface PasswordRecoveryFields {
    email: string;
    newPassword: string;
    passwordConfirmation: string;
}
