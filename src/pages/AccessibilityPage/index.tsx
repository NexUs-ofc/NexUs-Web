import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiCheck, FiEye, FiLink, FiPause } from "react-icons/fi";
import { MdOutlineCenterFocusStrong } from "react-icons/md";
import PageTitle from "../../components/PageTitle";
import { useAccessibility } from "../../hooks/useAccessibility";
import "../../../styles/pages/AccessibilityPage/accessibility-page.css";

const textSizes = [
    { value: 100, label: "Padrão · 100%" },
    { value: 125, label: "Ampliado · 125%" },
    { value: 150, label: "Maior · 150%" },
] as const;

const toggleOptions = [
    { key: "reduceMotion", title: "Reduzir movimento", description: "Diminui animações e transições da interface.", Icon: FiPause },
    { key: "highlightFocus", title: "Destacar foco do teclado", description: "Reforça o contorno do elemento em foco.", Icon: MdOutlineCenterFocusStrong },
    { key: "underlineLinks", title: "Sublinhar links", description: "Diferencia os links também pelo sublinhado.", Icon: FiLink },
] as const;

export default function AccessibilityPage() {
    const { preferences, setPreference, resetPreferences, storageError, systemReducedMotion } = useAccessibility();
    const [notice, setNotice] = useState("");
    const previewButton = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const previousTitle = document.title;
        document.title = "Preferências de acessibilidade — Ceris";
        return () => { document.title = previousTitle; };
    }, []);

    return (
        <main className="portal-page accessibility-page" aria-labelledby="accessibility-title">
            <header className="accessibility-page__heading">
                <PageTitle id="accessibility-title">Preferências de acessibilidade</PageTitle>
                <p>Ajuste a leitura e a navegação para usar o Ceris do seu jeito.</p>
            </header>

            <div className="accessibility-page__layout">
                <div className="accessibility-page__settings">
                    <section className="accessibility-card accessibility-preferences" aria-labelledby="reading-title">
                        <header className="accessibility-card__heading">
                            <h2 id="reading-title">Leitura e navegação</h2>
                            <span>Preferências pessoais</span>
                        </header>

                        <fieldset className="accessibility-choice" aria-describedby="text-size-description">
                            <legend>Tamanho do texto</legend>
                            <p id="text-size-description">Escolha o tamanho mais confortável para a leitura.</p>
                            <div className="accessibility-choice__options">
                                {textSizes.map(({ value, label }) => (
                                    <label key={value} className="accessibility-choice__option">
                                        <input type="radio" name="text-size" value={value} checked={preferences.textSize === value} onChange={() => setPreference("textSize", value)} />
                                        <span>{preferences.textSize === value ? <FiCheck aria-hidden="true" /> : null}{label}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        <fieldset className="accessibility-choice" aria-describedby="contrast-description">
                            <legend>Contraste</legend>
                            <p id="contrast-description">Altere a apresentação visual dos textos e das superfícies.</p>
                            <div className="accessibility-choice__options">
                                {([{ value: "standard", label: "Padrão" }, { value: "high", label: "Alto contraste" }] as const).map(({ value, label }) => (
                                    <label key={value} className="accessibility-choice__option">
                                        <input type="radio" name="contrast" value={value} checked={preferences.contrast === value} onChange={() => setPreference("contrast", value)} />
                                        <span>{preferences.contrast === value ? <FiCheck aria-hidden="true" /> : null}{label}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        <div className="accessibility-toggles">
                            {toggleOptions.map(({ key, title, description, Icon }) => (
                                <div key={key} className="accessibility-toggle">
                                    <span className="accessibility-toggle__icon"><Icon aria-hidden="true" /></span>
                                    <div className="accessibility-toggle__copy">
                                        <h3 id={`${key}-title`}>{title}</h3>
                                        <p id={`${key}-description`}>{description}</p>
                                        {key === "reduceMotion" && systemReducedMotion ? <p>A redução de movimento do seu sistema também é respeitada.</p> : null}
                                    </div>
                                    <button type="button" role="switch" aria-checked={preferences[key]} aria-labelledby={`${key}-title`} aria-describedby={`${key}-description`} onClick={() => setPreference(key, !preferences[key])}>
                                        <span className={`accessibility-toggle__dot${preferences[key] ? " accessibility-toggle__dot--active" : ""}`} aria-hidden="true" />
                                        {preferences[key] ? "Ativado" : "Desativado"}
                                    </button>
                                </div>
                            ))}
                        </div>

                        <p className="accessibility-preferences__privacy">As escolhas são pessoais e ficam neste navegador. Elas não alteram as preferências de outras pessoas.</p>
                    </section>

                    <section className="accessibility-card accessibility-reset" aria-labelledby="reset-title">
                        <div>
                            <h2 id="reset-title">Voltar ao padrão</h2>
                            <p>Remove apenas seus ajustes de acessibilidade.</p>
                        </div>
                        <button type="button" onClick={() => { resetPreferences(); setNotice("Preferências de acessibilidade restauradas."); }}>Restaurar preferências</button>
                    </section>
                    <p className="sr-only" role="status">{notice}</p>
                    {storageError ? <p className="accessibility-page__storage-error" role="status">Os ajustes foram aplicados, mas este navegador não permitiu salvá-los. Ao recarregar, eles podem ser perdidos.</p> : null}
                </div>

                <aside className="accessibility-page__help" aria-label="Exemplo de leitura e ajuda de navegação">
                    <section className="accessibility-card accessibility-example" aria-labelledby="example-title">
                        <h2 id="example-title"><FiEye aria-hidden="true" />Exemplo de leitura</h2>
                        <div className="accessibility-example__content">
                            <h3>Uma leitura mais clara</h3>
                            <p>Encontre informações e navegue no seu ritmo.</p>
                            <Link to="/dashboard">Conheça o Ceris</Link>
                            <button ref={previewButton} type="button" onClick={() => { previewButton.current?.focus(); setNotice("Exemplo acionado. Use Tab para continuar navegando."); }}>Continuar</button>
                        </div>
                        <p className="accessibility-example__caption">Exemplo com link sublinhado e destaque de foco.</p>
                    </section>

                    <section className="accessibility-card accessibility-keyboard" aria-labelledby="keyboard-title">
                        <h2 id="keyboard-title">Navegue pelo teclado</h2>
                        <dl>
                            <div><dt>Tab</dt><dd>Avançar entre elementos</dd></div>
                            <div><dt>Shift + Tab</dt><dd>Voltar ao elemento anterior</dd></div>
                            <div><dt>Enter / Espaço</dt><dd>Acionar botões e controles</dd></div>
                        </dl>
                    </section>
                </aside>
            </div>
        </main>
    );
}
