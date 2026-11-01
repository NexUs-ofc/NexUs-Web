import AuthLayout from "../../components/AuthLayout";
import PageTitle from "../../components/PageTitle";
import PrimaryButton from "../../components/PrimaryButton";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import OtpInputs from "../../components/OtpInputs";
import { Link } from "react-router-dom";
import { useVerificationForm } from "../../hooks/useVerificationForm";

export default function VerifyRegistrationPage() {
    const { registrationId, loading, error, success, otpControls, handleSubmit } = useVerificationForm();
    if (!registrationId) {
        return null;
    }

    return (
        <AuthLayout>
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
                <OtpInputs controls={otpControls} disabled={loading} />
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
        </AuthLayout>
    );
}
