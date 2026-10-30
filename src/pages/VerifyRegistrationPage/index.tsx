import { useCallback, useEffect, useRef, useState } from "react";
import type {
    ChangeEvent,
    ClipboardEvent,
    FormEvent,
    KeyboardEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import PrimaryButton from "../../components/PrimaryButton";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import { useVerifyRegistration } from "../../hooks/useVerifyRegistration";
import { loadRegistrationId } from "../../utils/registrationStorage";
import logoFullUrl from "../../../assets/logo-full.svg";
import logoSymbolUrl from "../../../assets/logo-symbol.svg";
import "../../../styles/auth.css";
import "../../../styles/pages/VerifyRegistrationPage/verify-registration-page.css";

const OTP_LENGTH = 6;

export default function VerifyRegistrationPage() {
    const navigate = useNavigate();
    const registrationId = loadRegistrationId();
    const { loading, error, success, execute, reset } = useVerifyRegistration();
    const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>(
        Array(OTP_LENGTH).fill(null),
    );

    const otp = digits.join("");
    const isComplete = digits.every((digit) => digit.length === 1);

    useEffect(() => {
        inputRefs.current[activeIndex]?.focus();
    }, [activeIndex]);

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
            navigate("/", { replace: true });
        }
    }, [success, navigate]);

    const handleDigitChange = useCallback(
        (index: number) => (event: ChangeEvent<HTMLInputElement>): void => {
            const value = event.target.value.replace(/\D/g, "").slice(0, 1);
            const next = [...digits];
            next[index] = value;
            setDigits(next);
            reset();
            if (value && index < OTP_LENGTH - 1) {
                setActiveIndex(index + 1);
            }
        },
        [digits, reset],
    );

    const handlePaste = useCallback(
        (index: number) => (event: ClipboardEvent<HTMLInputElement>): void => {
            event.preventDefault();
            const pasted = event.clipboardData
                .getData("text")
                .replace(/\D/g, "")
                .slice(0, OTP_LENGTH);
            const next = [...digits];
            for (let i = 0; i < pasted.length && index + i < OTP_LENGTH; i += 1) {
                next[index + i] = pasted[i];
            }
            setDigits(next);
            reset();
            const nextFocus = Math.min(index + pasted.length - 1, OTP_LENGTH - 1);
            setActiveIndex(nextFocus);
        },
        [digits, reset],
    );

    const handleKeyDown = useCallback(
        (index: number) => (event: KeyboardEvent<HTMLInputElement>): void => {
            if (event.key === "Backspace" && digits[index] === "" && index > 0) {
                event.preventDefault();
                setActiveIndex(index - 1);
            }
        },
        [digits],
    );

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        if (!registrationId || !isComplete) {
            return;
        }
        void execute({ registrationId, otp });
    };

    if (!registrationId) {
        return null;
    }

    if (loading) {
        return <LoadingSpinner message="Verificando seu código..." />;
    }

    if (success) {
        return null;
    }

    return (
        <div className="auth-page">
            <section className="brand-panel" aria-label="Apresentação NexUs">
                <header>
                    <img src={logoFullUrl} alt="Logotipo Ceris" />
                </header>
                <section className="slogan-section">
                    <div className="slogan-text huninn">
                        <div>
                            <p>Simplifique o controle das suas filiais e transforme dados operacionais em crescimento estratégico.</p>
                            <img src={logoSymbolUrl} alt="" aria-hidden="true" />
                        </div>
                        <hr />
                    </div>
                </section>
                <div className="gradient-sheet" aria-hidden="true" />
            </section>
            <section className="form-section">
                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <div className="auth-description-container">
                        <h1 className="title huninn auth-title">
                            Verifique seu cadastro
                        </h1>
                        <p className="subtitle montserrat auth-subtitle">
                            Um código de 6 dígitos foi enviado para o seu e-mail. Digite-o abaixo:
                        </p>
                    </div>
                    {error !== "" ? (
                        <ErrorAlert title="Não foi possível verificar o cadastro" message={error} />
                    ) : null}
                    <div className="otp-inputs">
                        {digits.map((digit, index) => (
                            <div key={index} className="otp-input-wrapper">
                                <label
                                    htmlFor={`otp-${index}`}
                                    className="otp-label"
                                >
                                    Dígito {index + 1}
                                </label>
                                <input
                                    id={`otp-${index}`}
                                    className="otp-input"
                                    type="text"
                                    inputMode="numeric"
                                    pattern="[0-9]"
                                    maxLength={1}
                                    value={digit}
                                    onChange={handleDigitChange(index)}
                                    onKeyDown={handleKeyDown(index)}
                                    onPaste={handlePaste(index)}
                                    ref={(element) => {
                                        inputRefs.current[index] = element;
                                    }}
                                    disabled={loading}
                                    aria-label={`Dígito ${index + 1} do código de verificação`}
                                />
                            </div>
                        ))}
                    </div>
                    <PrimaryButton
                        type="submit"
                        loading={loading}
                        disabled={!isComplete || loading}
                        className="auth-submit-button"
                    >
                        Verificar código
                    </PrimaryButton>
                    <p className="huninn auth-switch-text">
                        Não recebeu o código?{" "}
                        <Link to="/login" className="auth-switch-link">
                            Fazer Login
                        </Link>
                    </p>
                </form>
            </section>
        </div>
    );
}
