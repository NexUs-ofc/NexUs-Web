import type { ForgotPasswordPayload, ForgotPasswordResponse, ResetPasswordPayload, VerifyPasswordResetPayload, VerifyPasswordResetResponse } from "../types/passwordRecovery";
import { LOGIN_MAX_LENGTH, validateEmail } from "./validateLogin";
import { validatePassword } from "./validateRegistration";
import { asRecord } from "./responseParsers";
import { validateOtp } from "./validateAuth";

// IDs e tickets são valores opacos: não alterar seu conteúdo nem presumir UUID/JWT.
function validateResetCredential(value: unknown): string {
    if (typeof value !== "string" || !value.trim() || value.length > 16384 || /\p{Cc}/u.test(value)) {
        throw new Error("Identificação da recuperação inválida. Inicie a recuperação novamente.");
    }
    return value;
}

export function readRecoveryEmail(value: unknown): string {
    if (typeof value !== "object" || value === null || !("email" in value)) return "";
    return typeof value.email === "string" && value.email.length <= LOGIN_MAX_LENGTH.email ? value.email : "";
}

export function validateForgotPassword(payload: ForgotPasswordPayload): ForgotPasswordPayload {
    const email = payload.email.trim().toLowerCase();
    const error = validateEmail(email);
    if (error) throw new Error(error);
    return { email };
}

export function validatePasswordResetVerification(payload: VerifyPasswordResetPayload): VerifyPasswordResetPayload {
    return { resetId: validateResetCredential(payload.resetId), otp: validateOtp(payload.otp) };
}

export function validatePasswordReset(payload: ResetPasswordPayload): ResetPasswordPayload {
    const error = validatePassword(payload.newPassword);
    if (error) throw new Error(error);
    return { resetTicket: validateResetCredential(payload.resetTicket), newPassword: payload.newPassword };
}

export function parseForgotPasswordResponse(value: unknown): ForgotPasswordResponse {
    return { resetId: validateResetCredential(asRecord(value).resetId) };
}

export function parsePasswordResetVerificationResponse(value: unknown): VerifyPasswordResetResponse {
    return { resetTicket: validateResetCredential(asRecord(value).resetTicket) };
}
