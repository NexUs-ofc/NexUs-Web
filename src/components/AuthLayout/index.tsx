import type { ReactNode } from "react";
import PageFooter from "../PageFooter";
import logoFullUrl from "../../../assets/logo-full.svg";
import logoSymbolUrl from "../../../assets/logo-symbol.svg";
import "../../../styles/auth.css";

export interface AuthLayoutProps {
    children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="auth-page">
            <header className="brand-panel" aria-label="Apresentação NexUs">
                <div className="brand-logo"><img src={logoFullUrl} alt="Logotipo Ceris" /></div>
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
                <main className="auth-form-container">{children}</main>
                <PageFooter />
            </div>
        </div>
    );
}
