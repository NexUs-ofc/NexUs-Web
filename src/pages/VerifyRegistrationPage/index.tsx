import PageFooter from "../../components/PageFooter";
import PageTitle from "../../components/PageTitle";
import PrimaryButton from "../../components/PrimaryButton";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import logoFullUrl from "../../../assets/logo-full.svg";
import logoSymbolUrl from "../../../assets/logo-symbol.svg";
import "../../../styles/auth.css";
import "../../../styles/pages/VerifyRegistrationPage/verify-registration-page.css";
import { Link } from "react-router-dom";
import { useVerificationForm } from "../../hooks/useVerificationForm";

export default function VerifyRegistrationPage() {
    const { submitted, registrationId, loading, error, success, digits, inputRefs, handleDigitChange, handleKeyDown, handlePaste, handleSubmit } = useVerificationForm();
    if (!registrationId) {
        return null;
    }

    return (
        <div className="auth-page">
            <header className="brand-panel" aria-label="Apresentação NexUs">
                <div className="brand-logo">
                    <img src={logoFullUrl} alt="Logotipo Ceris" />
                </div>
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
            </header>
            <div className="form-section">
                <main className="auth-form-container">
                    <form className="auth-form" onSubmit={handleSubmit} noValidate>
                        <div className="auth-description-container">
                            <PageTitle className="title huninn auth-title">
                                Verifique seu cadastro
                            </PageTitle>
                            <p className="subtitle montserrat auth-subtitle">
                                Um código de 6 dígitos foi enviado para o seu e-mail. Digite-o abaixo:
                            </p>
                        </div>
                        <p role="status" className="sr-only">Cadastro iniciado. Informe o código enviado ao seu e-mail.</p>
                        {error !== "" ? (
                            <ErrorAlert title="Não foi possível verificar o cadastro" message={error} />
                        ) : null}
                        {loading ? <LoadingSpinner message="Verificando seu código..." /> : null}
                        {success ? <p role="status">Cadastro verificado com sucesso.</p> : null}
                        <div className="otp-inputs" aria-busy={loading}>
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
                                        aria-invalid={submitted && !digit}
                                        aria-describedby={submitted && !digit ? `otp-error-${index}` : undefined}
                                        disabled={loading}
                                        aria-label={`Dígito ${index + 1} do código de verificação`}
                                    />
                                    {submitted && !digit ? <span id={`otp-error-${index}`} className="otp-field-error" role="alert">Informe o dígito {index + 1}.</span> : null}
                                </div>
                            ))}
                        </div>
                        <PrimaryButton
                            type="submit"
                            loading={loading}
                            disabled={loading || success}
                            className="auth-submit-button"
                        >
                            Verificar código
                        </PrimaryButton>
                        <nav aria-label="Acesso à conta" className="huninn auth-switch-text">
                            Não recebeu o código?{" "}
                            <Link to="/login" className="auth-switch-link">
                                Fazer Login
                            </Link>
                        </nav>
                    </form>
                </main>
                <PageFooter />
            </div>
        </div>
    );
}
