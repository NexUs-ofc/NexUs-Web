import logoFullUrl from "../../assets/logo-full.svg";
import logoSymbolUrl from "../../assets/logo-symbol.svg";
import { Link } from "react-router-dom";
import FormInput from "../../components/FormInput";
import PrimaryButton from "../../components/PrimaryButton";
import "../../styles/auth.css";
import "./register-page.css";

export default function RegisterPage() {
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
                <form className="auth-form" noValidate>
                    <div className="auth-description-container">
                        <h1 className="title huninn auth-title">
                            Bem-vindo(a)!
                        </h1>
                        <p className="subtitle montserrat auth-subtitle">
                            Para criar sua conta, preencha os dados abaixo:
                        </p>
                    </div>
                    <div className="auth-inputs-container register-inputs-container">
                        <FormInput
                            label="Nome da empresa"
                            name="name"
                            type="text"
                            value=""
                            onChange={(e) => console.log(e)}
                            placeholder="Sua razão social"
                            required
                            width="47%"
                        />
                        <FormInput
                            label="CNPJ"
                            name="cnpj"
                            type="text"
                            value=""
                            onChange={(e) => console.log(e)}
                            placeholder="00.000.000/0001-00"
                            required
                            width="47%"
                        />
                        <FormInput
                            label="E-mail corporativo"
                            name="email"
                            type="email"
                            value=""
                            onChange={(e) => console.log(e)}
                            placeholder="contato@empresa.com"
                            required
                            width="47%"
                        />
                        <FormInput
                            label="Telefone"
                            name="phone"
                            type="text"
                            value=""
                            onChange={(e) => console.log(e)}
                            placeholder="(11) 99999-99"
                            required
                            width="47%"
                        />
                        <FormInput
                            label="Senha"
                            name="password"
                            type="password"
                            value=""
                            onChange={(e) => console.log(e)}
                            placeholder="Digite sua senha"
                            required
                            width="47%"
                        />
                        <FormInput
                            label="Confirmar senha"
                            name="password_confirmation"
                            type="password"
                            value=""
                            onChange={(e) => console.log(e)}
                            placeholder="Repita a senha"
                            required
                            width="47%"
                        />
                    </div>
                    <PrimaryButton type="submit" loading={false} className="auth-submit-button">
                        Criar minha conta
                    </PrimaryButton>
                    <p className="huninn auth-switch-text">
                        Já possui uma conta corporativa?{" "}
                        <Link to="/login" className="auth-switch-link">
                            Fazer Login
                        </Link>
                    </p>
                </form>
            </section>
        </div>
    );
}
