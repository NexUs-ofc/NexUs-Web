import PageFooter from "../../components/PageFooter";
import PageTitle from "../../components/PageTitle";
import FormInput from "../../components/FormInput";
import PrimaryButton from "../../components/PrimaryButton";
import ErrorAlert from "../../components/ErrorAlert";
import logoFullUrl from "../../../assets/logo-full.svg";
import logoSymbolUrl from "../../../assets/logo-symbol.svg";
import "../../../styles/auth.css";
import "../../../styles/pages/RegisterPage/register-page.css";
import { Link } from "react-router-dom";
import { REGISTRATION_MAX_LENGTH } from "../../types/registration";
import { maskCnpj, maskPhone } from "../../utils/masks";
import { useRegisterForm } from "../../hooks/useRegisterForm";

export default function RegisterPage() {
    const { formRef, form, fieldErrors, hasSubmitted, touchedFields, registrationError, handleChange, handleSubmit } = useRegisterForm();
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
                                Bem-vindo(a)!
                            </PageTitle>
                            <p className="subtitle montserrat auth-subtitle">
                                Para criar sua conta, preencha os dados abaixo:
                            </p>
                        </div>
                        {registrationError !== "" ? (
                            <ErrorAlert title="Não foi possível iniciar o cadastro" message={registrationError} />
                        ) : null}
                        <div className="auth-inputs-container register-inputs-container">
                            <FormInput
                                label="Nome da empresa"
                                name="name"
                                type="text"
                                value={form.name}
                                onChange={handleChange("name")}
                                maxLength={REGISTRATION_MAX_LENGTH.name}
                                autoComplete="organization"
                                placeholder="Sua razão social"
                                required
                                error={hasSubmitted || touchedFields.has("name") ? fieldErrors.name : ""}
                                reserveErrorSpace
                                width="47%"
                            />
                            <FormInput
                                label="CNPJ"
                                name="cnpj"
                                type="text"
                                value={form.cnpj}
                                onChange={handleChange("cnpj")}
                                mask={maskCnpj}
                                maxLength={REGISTRATION_MAX_LENGTH.cnpj}
                                placeholder="00.000.000/0001-00"
                                required
                                error={hasSubmitted || touchedFields.has("cnpj") ? fieldErrors.cnpj : ""}
                                reserveErrorSpace
                                width="47%"
                            />
                            <FormInput
                                label="E-mail corporativo"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange("email")}
                                maxLength={REGISTRATION_MAX_LENGTH.email}
                                autoComplete="email"
                                placeholder="contato@empresa.com"
                                required
                                error={hasSubmitted || touchedFields.has("email") ? fieldErrors.email : ""}
                                reserveErrorSpace
                                width="47%"
                            />
                            <FormInput
                                label="Telefone"
                                name="phone"
                                type="tel"
                                value={form.phone}
                                onChange={handleChange("phone")}
                                mask={maskPhone}
                                maxLength={REGISTRATION_MAX_LENGTH.phone}
                                autoComplete="tel-national"
                                placeholder="(11) 99999-9999"
                                required
                                error={hasSubmitted || touchedFields.has("phone") ? fieldErrors.phone : ""}
                                reserveErrorSpace
                                width="47%"
                            />
                            <FormInput
                                label="Senha"
                                name="password"
                                type="password"
                                value={form.password}
                                onChange={handleChange("password")}
                                maxLength={REGISTRATION_MAX_LENGTH.password}
                                autoComplete="new-password"
                                placeholder="Digite sua senha"
                                required
                                error={hasSubmitted || touchedFields.has("password") ? fieldErrors.password : ""}
                                reserveErrorSpace
                                width="47%"
                            />
                            <FormInput
                                label="Confirmar senha"
                                name="password_confirmation"
                                type="password"
                                value={form.passwordConfirmation}
                                onChange={handleChange("passwordConfirmation")}
                                maxLength={REGISTRATION_MAX_LENGTH.password}
                                autoComplete="new-password"
                                placeholder="Repita a senha"
                                required
                                error={hasSubmitted || touchedFields.has("passwordConfirmation") ? fieldErrors.passwordConfirmation : ""}
                                reserveErrorSpace
                                width="47%"
                            />
                        </div>
                        <PrimaryButton type="submit" className="auth-submit-button">
                            Criar minha conta
                        </PrimaryButton>
                        <nav aria-label="Acesso à conta" className="huninn auth-switch-text">
                            Já possui uma conta corporativa?{" "}
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
