import { type ChangeEvent, useState } from "react";
import FormInput from "../../components/FormInput";
import "./login-page.css";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const [senha, setSenha] = useState("");
    const handleSenhaChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSenha(e.target.value);
    };
    return (
        <div id="login-page">
            <section id="brand-panel">
                <header>
                    <img src="/src/assets/logo-full.svg" alt="Ceris" />
                </header>
                <section id="slogan-section">
                    <div id="slogan-text" className="huninn">
                        <div>
                            <p>Simplifique o controle das suas filiais e transforme dados operacionais em crescimento estratégico.</p>
                            <img src="/src/assets/logo-symbol.svg" alt="Logo do Ceris" />
                        </div>
                        <hr />
                    </div>
                </section>
                <div id="gradient-sheet"></div>
            </section>
            <section id="form-section">
                <form id="login-form">
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
                            width="100%"
                            label="E-mail corporativo"
                            placeholder="exemplo@empresa.com"
                            onChange={handleEmailChange}
                        />
                        <FormInput
                            type="password"
                            width="100%"
                            label="Senha"
                            placeholder="Digite sua senha de acesso"
                            onChange={handleSenhaChange}
                        />
                        <a href="#" id="forgot-password-text">
                            Esqueci minha senha
                        </a>
                    </div>
                    <button
                        type="submit"
                        className="primary-button huninn"
                        id="submit-login-form-button"
                    >
                        Entrar na conta
                    </button>
                    <p className="huninn" id="signup-text">
                        Ainda não tem conta corporativa?{" "}
                        <a href="#" id="signup-link">
                            Cadastre-se
                        </a>
                    </p>
                </form>
            </section>
        </div>
    );
}
