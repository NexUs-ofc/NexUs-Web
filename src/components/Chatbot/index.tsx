import { useEffect, useRef, useCallback } from "react";
import ceritaAvatarUrl from "../../../assets/cerita-avatar.png";
import { useChatbot } from "../../hooks/useChatbot";
import { useAccessibility } from "../../hooks/useAccessibility";
import "../../../styles/components/Chatbot/chatbot.css";

export default function Chatbot() {
    const { reducedMotion } = useAccessibility();
    const {
        isOpen,
        messages,
        loading,
        error,
        inputValue,
        toggle,
        close,
        setInputValue,
        sendQuestion,
        clearError,
    } = useChatbot();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const toggleBtnRef = useRef<HTMLButtonElement>(null);
    const wasOpenRef = useRef(false);

    // Rola para a última mensagem sempre que a lista muda ou o loading aparece.
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth" });
    }, [messages, loading, reducedMotion]);

    // Foca o campo de texto ao abrir; devolve foco ao botão ao fechar.
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        } else if (wasOpenRef.current) {
            toggleBtnRef.current?.focus();
        }
        wasOpenRef.current = isOpen;
    }, [isOpen]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendQuestion();
            }
        },
        [sendQuestion],
    );

    const hasMessages = messages.length > 0;

    return (
        <div className="chatbot">
            {/* Painel de chat */}
            {isOpen && (
                <section
                    className="chatbot__panel"
                    role="dialog"
                    aria-label="Assistente Cerita"
                    aria-modal="true"
                >
                    {/* Cabeçalho */}
                    <header className="chatbot__header">
                        <div className="chatbot__header-avatar" aria-hidden="true">
                            <img src={ceritaAvatarUrl} alt="" className="chatbot__avatar-img" />
                        </div>
                        <div className="chatbot__header-info">
                            <p className="chatbot__name">Cerita</p>
                            <p className="chatbot__status">
                                <span className="chatbot__status-dot" aria-hidden="true" />
                                Online · pronta para ajudar
                            </p>
                        </div>
                        <button
                            type="button"
                            className="chatbot__close-btn"
                            aria-label="Fechar assistente"
                            onClick={close}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
                                <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                            </svg>
                        </button>
                    </header>

                    {/* Corpo */}
                    <div className="chatbot__body" aria-live="polite" aria-label="Mensagens do chat">
                        {!hasMessages ? (
                            <div className="chatbot__welcome">
                                <div className="chatbot__welcome-card">
                                    <p className="chatbot__welcome-text">
                                        Precisa de uma mão rápida para encontrar um relatório,
                                        comparar filiais ou entender o que está acontecendo este mês?
                                    </p>
                                    <p className="chatbot__welcome-hint">
                                        Digite sua pergunta abaixo.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <ul className="chatbot__messages" role="list">
                                {messages.map((msg) => (
                                    <li key={msg.id} className={`chatbot__message chatbot__message--${msg.role}`}>
                                        {msg.role === "assistant" && (
                                            <span className="chatbot__message-avatar" aria-hidden="true">
                                                <img src={ceritaAvatarUrl} alt="" />
                                            </span>
                                        )}
                                        <div className="chatbot__message-bubble">
                                            <p className="chatbot__message-content">{msg.content}</p>
                                        </div>
                                    </li>
                                ))}
                                {loading && (
                                    <li className="chatbot__message chatbot__message--assistant" aria-label="Cerita está digitando">
                                        <span className="chatbot__message-avatar" aria-hidden="true">
                                            <img src={ceritaAvatarUrl} alt="" />
                                        </span>
                                        <div className="chatbot__message-bubble">
                                            <span className="chatbot__typing" role="status" aria-label="Digitando...">
                                                <span /><span /><span />
                                            </span>
                                        </div>
                                    </li>
                                )}
                                <div ref={messagesEndRef} aria-hidden="true" />
                            </ul>
                        )}

                        {loading && !hasMessages && (
                            <div className="chatbot__initial-loading" role="status" aria-label="Aguardando resposta...">
                                <span className="chatbot__typing">
                                    <span /><span /><span />
                                </span>
                            </div>
                        )}

                        {error && (
                            <div className="chatbot__error" role="alert">
                                <p>{error}</p>
                                <button
                                    type="button"
                                    className="chatbot__error-dismiss"
                                    onClick={clearError}
                                    aria-label="Fechar mensagem de erro"
                                >
                                    Tentar novamente
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Rodapé */}
                    <footer className="chatbot__footer">
                        <div className="chatbot__input-row">
                            <label htmlFor="chatbot-input" className="chatbot__input-label">
                                Mensagem
                            </label>
                            <textarea
                                id="chatbot-input"
                                ref={inputRef}
                                className="chatbot__input"
                                placeholder="Digite sua pergunta..."
                                value={inputValue}
                                rows={1}
                                disabled={loading}
                                aria-disabled={loading}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                            <button
                                type="button"
                                className="chatbot__send-btn"
                                aria-label="Enviar mensagem"
                                disabled={!inputValue.trim() || loading}
                                onClick={() => sendQuestion()}
                            >
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true" focusable="false">
                                    <path d="M15.75 9L2.25 2.25l2.625 6.75L2.25 15.75 15.75 9z" fill="currentColor" />
                                </svg>
                            </button>
                        </div>
                        <p className="chatbot__disclaimer">
                            O assistente ajuda a apontar caminhos. Revise os dados críticos antes de tomar decisões.
                        </p>
                    </footer>
                </section>
            )}

            {/* Botão flutuante */}
            <button
                ref={toggleBtnRef}
                type="button"
                className={`chatbot__toggle${isOpen ? " chatbot__toggle--open" : ""}`}
                aria-label={isOpen ? "Fechar assistente Cerita" : "Abrir assistente Cerita"}
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                onClick={toggle}
            >
                {isOpen ? (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true" focusable="false">
                        <path d="M17 5L5 17M5 5l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" fill="currentColor" />
                    </svg>
                )}
            </button>
        </div>
    );
}
