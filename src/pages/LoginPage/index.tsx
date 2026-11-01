import PageFooter from "../../components/PageFooter";
import PageTitle from "../../components/PageTitle";
import FormInput from "../../components/FormInput";
import PrimaryButton from "../../components/PrimaryButton";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import logoFullUrl from "../../../assets/logo-full.svg";
import logoSymbolUrl from "../../../assets/logo-symbol.svg";
import "../../../styles/auth.css";
import "../../../styles/pages/LoginPage/login-page.css";
import { Link } from "react-router-dom";
import { LOGIN_MAX_LENGTH } from "../../utils/validateLogin";
import { useLoginForm } from "../../hooks/useLoginForm";

export default function LoginPage() {
    const { formRef, form, fieldErrors, loading, error, success, handleChange, handleSubmit } = useLoginForm();
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
                    <form ref={formRef} className="auth-form" onSubmit={handleSubmit} noValidate>
                        <div className="auth-description-container">
                            <PageTitle className="title huninn auth-title">
                                Bem-vindo(a) de volta!
                            </PageTitle>
                            <p className="subtitle montserrat auth-subtitle">
                                Acesse sua conta empresarial
                            </p>
                        </div>
                        <div className="auth-inputs-container login-inputs-container">
                            <FormInput
                                label="E-mail corporativo"
                                name="email"
                                type="email"
                                placeholder="exemplo@empresa.com"
                                value={form.email}
                                onChange={handleChange("email")}
                                maxLength={LOGIN_MAX_LENGTH.email}
                                autoComplete="email"
                                required
                                error={fieldErrors.email}
                                width="100%"
                            />
                            <FormInput
                                label="Senha"
                                name="password"
                                type="password"
                                placeholder="Digite sua senha de acesso"
                                value={form.password}
                                onChange={handleChange("password")}
                                maxLength={LOGIN_MAX_LENGTH.password}
                                autoComplete="current-password"
                                required
                                error={fieldErrors.password}
                                width="100%"
                            />
                            <Link to="/esqueci-senha" className="forgot-password-text">
                                Esqueci minha senha
                            </Link>
                        </div>
                        {loading ? <LoadingSpinner message="Entrando na sua conta..." /> : null}
                        {error !== "" ? <ErrorAlert title="Não foi possível entrar" message={error} /> : null}
                        {success ? (
                            <p className="loginSuccess" role="status">
                                Login realizado com sucesso.
                            </p>
                        ) : null}
                        <PrimaryButton type="submit" loading={loading} className="auth-submit-button">
                            Entrar na conta
                        </PrimaryButton>
                        <nav aria-label="Acesso à conta" className="huninn auth-switch-text">
                            Ainda não tem conta corporativa?{" "}
                            <Link to="/cadastro" className="auth-switch-link">
                                Cadastre-se
                            </Link>
                        </nav>
                    </form>
                </main>
                <PageFooter />
            </div>
        </div>
    );
}
