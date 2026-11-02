import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useOtpInputs } from "./useOtpInputs";
import { useNavigate } from "react-router-dom";
import { useVerifyRegistration } from "./useVerifyRegistration";
import { loadRegistrationId } from "../utils/registrationStorage";

export function useVerificationForm() {
    const [registrationId] = useState(loadRegistrationId);
    const navigate = useNavigate();
    const { loading, error, success, execute, reset } = useVerifyRegistration();
    const otpControls = useOtpInputs(reset);
    const { isComplete, otp, inputRefs } = otpControls;

    useEffect(() => {
        if (!registrationId || !isComplete || loading || success || error) {
            return;
        }
        void execute({ registrationId, otp });
    }, [isComplete, otp, execute, registrationId, loading, success, error]);

    useEffect(() => {
        if (!registrationId) {
            navigate("/cadastro", { replace: true });
        }
    }, [registrationId, navigate]);

    useEffect(() => {
        if (success) {
            navigate("/dashboard", { replace: true });
        }
    }, [success, navigate]);

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        if (loading || success || !registrationId || !otpControls.validate()) return;
        void execute({ registrationId, otp });
    };

    useEffect(() => {
        if (!loading && error) inputRefs.current[0]?.focus();
    }, [loading, error, inputRefs]);

    return { registrationId, loading, error, success, otpControls, handleSubmit };
}
