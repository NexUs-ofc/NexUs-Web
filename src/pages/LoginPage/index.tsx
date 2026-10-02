import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";
import FormInput from "../../components/FormInput";
import PrimaryButton from "../../components/PrimaryButton";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import { useLogin } from "../../hooks/useLogin";
import { LOGIN_MAX_LENGTH, validateLoginForm } from "../../utils/validateLogin";
import type { LoginFormData, LoginFormErrors } from "../../utils/validateLogin";
import logoFullUrl from "../../assets/logo-full.svg";
import logoSymbolUrl from "../../assets/logo-symbol.svg";
import "./login-page.css";

const initialForm: LoginFormData = { email: "", password: "" };
const initialErrors: LoginFormErrors = { email: "", password: "" };

export default function LoginPage() {
    const [form, setForm] = useState<LoginFormData>(initialForm);
    const [fieldErrors, setFieldErrors] = useState<LoginFormErrors>(initialErrors);
    const { loading, error, success, execute, reset } = useLogin();

    useEffect(() => {
        document.title = "Entrar — NexUs";
    }, []);

    const handleChange = useCallback(
        (field: keyof LoginFormData) => (event: ChangeEvent<HTMLInputElement>) => {
            const nextForm = { ...form, [field]: event.target.value };
            setForm(nextForm);
            reset();
            setFieldErrors(validateLoginForm(nextForm));
        },
        [form, reset],
    );

    const fieldErrorsMemo = useMemo(() => fieldErrors, [fieldErrors]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        const validation = validateLoginForm(form);
        setFieldErrors(validation);
        await execute(form);
    }

    return (
        <div id="login-page">
            <section id="brand-panel" aria-label="Apresentação NexUs">
                <header>
                    <img src={logoFullUrl} alt="Logotipo Ceris" />
                </header>
                <section id="slogan-section">
                    <div id="slogan-text" className="huninn">
                        <div>
                            <p>Simplifique o controle das suas filiais e transforme dados operacionais em crescimento estratégico.</p>
                            <img src={logoSymbolUrl} alt="" aria-hidden="true" />
                        </div>
                        <hr />
                    </div>
                </section>
                <div id="gradient-sheet" aria-hidden="true" />
            </section>
            <section id="form-section">
                <form id="login-form" onSubmit={handleSubmit} noValidate>
                    <div id="login-description-container">
                        <h1 className="title huninn" id="loginTitle">
                            Bem-vindo(a) de volta!
                        </h1>
                        <p className="subtitle montserrat" id="loginSubtitle">
                            Acesse sua conta empresarial
                        </p>
                    </div>
                    <div id="login-inputs-container">
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
                            error={fieldErrorsMemo.email}
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
                            error={fieldErrorsMemo.password}
                            width="100%"
                        />
                        <Link to="/esqueci-senha" id="forgot-password-text">
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
                    <PrimaryButton type="submit" loading={loading} id="submit-login-form-button">
                        Entrar na conta
                    </PrimaryButton>
                    <p className="huninn" id="signup-text">
                        Ainda não tem conta corporativa?{" "}
                        <Link to="/cadastro" id="signup-link">
                            Cadastre-se
                        </Link>
                    </p>
                </form>
            </section>
        </div>
    );
}
