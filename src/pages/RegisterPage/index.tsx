import PageTitle from "../../components/PageTitle";
import { useCallback, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import FormInput from "../../components/FormInput";
import PrimaryButton from "../../components/PrimaryButton";
import ErrorAlert from "../../components/ErrorAlert";
import { REGISTRATION_MAX_LENGTH } from "../../types/registration";
import { maskCnpj, maskPhone } from "../../utils/masks";
import { loadRegistrationDraft, saveRegistrationDraft } from "../../utils/registrationStorage";
import {
    isRegistrationFormDataValid,
    toRegistrationDraft,
    validateRegistrationFormData,
} from "../../utils/validateRegistration";
import type { RegistrationFormData, RegistrationFormErrors } from "../../utils/validateRegistration";
import logoFullUrl from "../../../assets/logo-full.svg";
import logoSymbolUrl from "../../../assets/logo-symbol.svg";
import "../../../styles/auth.css";
import "../../../styles/pages/RegisterPage/register-page.css";

const initialForm: RegistrationFormData = {
    name: "",
    cnpj: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirmation: "",
};

const initialErrors: RegistrationFormErrors = {
    name: "",
    cnpj: "",
    email: "",
    phone: "",
    password: "",
    passwordConfirmation: "",
};

interface RegisterLocationState {
    registrationError: string;
}

function isRegisterLocationState(value: unknown): value is RegisterLocationState {
    if (typeof value !== "object" || value === null) {
        return false;
    }
    const record = value as Record<string, unknown>;
    return typeof record["registrationError"] === "string";
}

export default function RegisterPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const draft = loadRegistrationDraft();
    const [form, setForm] = useState<RegistrationFormData>(() => {
        if (!draft) {
            return initialForm;
        }
        return {
            name: draft.name,
            cnpj: draft.cnpj,
            email: draft.email,
            phone: draft.phones?.[0] ?? "",
            password: draft.password,
            passwordConfirmation: "",
        };
    });
    const [fieldErrors, setFieldErrors] = useState<RegistrationFormErrors>(() => {
        if (!draft) {
            return initialErrors;
        }
        return validateRegistrationFormData({
            name: draft.name,
            cnpj: draft.cnpj,
            email: draft.email,
            phone: draft.phones?.[0] ?? "",
            password: draft.password,
            passwordConfirmation: "",
        });
    });
    const [touchedFields, setTouchedFields] = useState<Set<keyof RegistrationFormData>>(() => new Set());
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const registrationError = isRegisterLocationState(location.state)
        ? location.state.registrationError
        : "";

    const handleChange = useCallback(
        (field: keyof RegistrationFormData) => (event: ChangeEvent<HTMLInputElement>) => {
            const nextForm = { ...form, [field]: event.target.value };
            setForm(nextForm);
            setTouchedFields((current) => new Set(current).add(field));
            setFieldErrors(validateRegistrationFormData(nextForm));
        },
        [form],
    );

    function handleSubmit(event: FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        setHasSubmitted(true);
        const errors = validateRegistrationFormData(form);
        setFieldErrors(errors);
        if (!isRegistrationFormDataValid(errors)) {
            return;
        }
        saveRegistrationDraft(toRegistrationDraft(form));
        navigate("/planos");
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
            <main className="form-section">
                <form className="auth-form" onSubmit={handleSubmit} noValidate>
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
                    <p className="huninn auth-switch-text">
                        Já possui uma conta corporativa?{" "}
                        <Link to="/login" className="auth-switch-link">
                            Fazer Login
                        </Link>
                    </p>
                </form>
            </main>
        </div>
    );
}
