import { Link } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import PageTitle from "../../components/PageTitle";
import FormInput from "../../components/FormInput";
import OtpInputs from "../../components/OtpInputs";
import PrimaryButton from "../../components/PrimaryButton";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import { usePasswordRecovery } from "../../hooks/usePasswordRecovery";
import { LOGIN_MAX_LENGTH } from "../../utils/validateLogin";
import "../../../styles/pages/PasswordRecoveryPage/password-recovery-page.css";

const content = {
    email: { title: "Recupere sua senha", description: "Informe o e-mail da sua conta para receber o código de verificação.", action: "Enviar código", loading: "Enviando código de verificação..." },
    verification: { title: "Verifique seu e-mail", description: "Um código de 6 dígitos foi enviado para o seu e-mail. Digite-o abaixo:", action: "Verificar código", loading: "Verificando seu código..." },
    password: { title: "Crie uma nova senha", description: "Digite e confirme sua nova senha de acesso.", action: "Redefinir senha", loading: "Redefinindo sua senha..." },
    success: { title: "Senha redefinida!", description: "Sua senha foi atualizada. Acesse sua conta com a nova senha.", action: "", loading: "" },
};

export default function PasswordRecoveryPage() {
    const { step, form, fieldErrors, formRef, loading, error, maskedEmail, otpControls, handleChange, handleSubmit, restart } = usePasswordRecovery();
    const current = content[step.stage];
    return (
        <AuthLayout>
            <form ref={formRef} className="auth-form password-recovery-form" onSubmit={handleSubmit} noValidate aria-busy={loading}>
                <div className="auth-description-container">
                    <PageTitle key={step.stage} className="title huninn auth-title">{current.title}</PageTitle>
                    <p className="subtitle montserrat auth-subtitle">{current.description}</p>
                </div>
                {step.stage === "email" ? (
                    <FormInput label="E-mail corporativo" name="email" type="email" placeholder="exemplo@empresa.com" value={form.email} onChange={handleChange("email")} maxLength={LOGIN_MAX_LENGTH.email} autoComplete="email" required disabled={loading} error={fieldErrors.email} />
                ) : null}
                {step.stage === "verification" ? (
                    <>
                        <p role="status" className="password-recovery-status">Código enviado para {maskedEmail}.</p>
                        <OtpInputs controls={otpControls} disabled={loading} />
                    </>
                ) : null}
                {step.stage === "password" ? (
                    <>
                        <p role="status" className="password-recovery-status">Código verificado com sucesso.</p>
                        <p className="password-recovery-hint">Use de 6 a {LOGIN_MAX_LENGTH.password} caracteres.</p>
                        <FormInput label="Nova senha" name="newPassword" type="password" placeholder="Digite sua nova senha" value={form.newPassword} onChange={handleChange("newPassword")} maxLength={LOGIN_MAX_LENGTH.password} autoComplete="new-password" required disabled={loading} error={fieldErrors.newPassword} />
                        <FormInput label="Confirme a nova senha" name="passwordConfirmation" type="password" placeholder="Digite novamente sua nova senha" value={form.passwordConfirmation} onChange={handleChange("passwordConfirmation")} maxLength={LOGIN_MAX_LENGTH.password} autoComplete="new-password" required disabled={loading} error={fieldErrors.passwordConfirmation} />
                    </>
                ) : null}
                {loading ? <LoadingSpinner message={current.loading} /> : null}
                {error ? <ErrorAlert title="Não foi possível recuperar a senha" message={error} /> : null}
                {step.stage === "success" ? (
                    <p role="status" className="password-recovery-status">Senha redefinida com sucesso.</p>
                ) : (
                    <PrimaryButton type="submit" loading={loading} className="auth-submit-button">{current.action}</PrimaryButton>
                )}
                <nav aria-label="Acesso à conta" className="huninn auth-switch-text">
                    {step.stage === "verification" || step.stage === "password" ? <button type="button" className="auth-switch-link password-recovery-restart" onClick={restart} disabled={loading}>Iniciar recuperação novamente</button> : null}
                    <Link to="/login" className="auth-switch-link">{step.stage === "success" ? "Entrar na conta" : "Voltar para o login"}</Link>
                </nav>
            </form>
        </AuthLayout>
    );
}
