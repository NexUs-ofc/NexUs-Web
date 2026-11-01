import { useEffect, useId, useRef } from "react";
import { FiAlertCircle, FiArrowRight, FiCreditCard, FiInfo, FiX } from "react-icons/fi";
import type { PaymentDialogState } from "../../types/payment";
import { useDialog } from "../../hooks/useDialog";
import { formatPaymentAmount, formatPaymentDate, formatPaymentPeriod } from "../../utils/paymentFilters";
import ErrorAlert from "../ErrorAlert";
import LoadingSpinner from "../LoadingSpinner";
import "../../../styles/components/PaymentDialog/payment-dialog.css";

export interface PaymentDialogProps {
    state: Exclude<PaymentDialogState, { phase: "closed" }>;
    planName: string;
    onConfirm: () => void;
    onRefresh: () => void;
    onClose: () => void;
}

export default function PaymentDialog({ state, planName, onConfirm, onRefresh, onClose }: PaymentDialogProps) {
    const titleId = useId();
    const dialogRef = useDialog("payments-title");
    const statusRef = useRef<HTMLDivElement>(null);
    const successButtonRef = useRef<HTMLButtonElement>(null);
    const errorButtonRef = useRef<HTMLButtonElement>(null);
    const busy = state.phase === "processing";
    const success = state.phase === "success";
    const staged = busy || success;
    const { payment } = state;
    const titles = {
        loading: "Carregando cobrança",
        confirm: "Confirmar pagamento",
        processing: "Confirmando pagamento",
        success: "Pagamento concluído!",
        error: "Confira sua cobrança",
    };
    const descriptions = {
        loading: "Estamos conferindo os dados atualizados do pagamento.",
        confirm: "Confira os detalhes antes de continuar.",
        processing: "Só um instante. Estamos confirmando seu pagamento simulado.",
        success: "Tudo certo! Sua cobrança foi quitada.",
        error: "Confira o status do pagamento antes de tentar novamente.",
    };

    useEffect(() => {
        if (state.phase === "processing") statusRef.current?.focus();
        if (state.phase === "success") successButtonRef.current?.focus();
        if (state.phase === "error") errorButtonRef.current?.focus();
    }, [state.phase]);

    return (
        <dialog
            ref={dialogRef}
            className={"payment-dialog" + (staged ? " payment-dialog--staged" : "")}
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={titleId + "-description"}
            aria-busy={busy || state.phase === "loading"}
            onCancel={(event) => { event.preventDefault(); if (!busy) onClose(); }}
        >
            {!staged ? <button type="button" className="payment-dialog__close" onClick={onClose} aria-label="Fechar pagamento"><FiX aria-hidden="true" /></button> : null}
            {staged ? (
                <div className="payment-dialog__stage" ref={statusRef} tabIndex={-1}>
                    {success ? (
                        <svg className="payment-success" viewBox="0 0 140 140" aria-hidden="true">
                            <g className="payment-success__confetti" fill="#B79AD4">
                                <circle cx="12" cy="34" r="3" /><circle cx="127" cy="93" r="3" fill="#72CFA8" />
                                <path d="m115 24 6 7M14 99l7-5M117 116l5 4" stroke="#B79AD4" strokeWidth="3" strokeLinecap="round" />
                            </g>
                            <circle className="payment-success__halo" cx="70" cy="70" r="58" fill="#EAF8F0" />
                            <circle className="payment-success__circle" cx="70" cy="70" r="38" fill="#16835D" />
                            <path className="payment-success__check" d="m53 70 11 11 23-25" fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    ) : <span className="payment-dialog__processing" aria-hidden="true" />}
                </div>
            ) : <span className="payment-dialog__icon" aria-hidden="true">{state.phase === "error" ? <FiAlertCircle /> : <FiCreditCard />}</span>}
            <header className="payment-dialog__header" aria-live="polite">
                <h2 id={titleId}>{titles[state.phase]}</h2>
                <p id={titleId + "-description"}>{descriptions[state.phase]}</p>
            </header>
            {state.phase === "loading" ? <LoadingSpinner message="Conferindo cobrança..." /> : state.phase === "error" ? <ErrorAlert title="Não foi possível concluir" message={state.message} /> : (
                <div className="payment-dialog__details">
                    <p className="payment-dialog__plan">Plano {planName}</p>
                    <p className="payment-dialog__amount">{formatPaymentAmount(payment.amount)}</p>
                    <p className="payment-dialog__period">Referência · {formatPaymentPeriod(payment)}</p>
                    {!staged ? (
                        <dl className="payment-dialog__metadata">
                            <div><dt>Vencimento</dt><dd><time dateTime={payment.dueDate}>{formatPaymentDate(payment.dueDate)}</time></dd></div>
                            <div><dt>Forma de pagamento</dt><dd>Pix simulado</dd></div>
                        </dl>
                    ) : null}
                </div>
            )}
            {state.phase === "confirm" ? (
                <p className="payment-dialog__notice"><FiInfo aria-hidden="true" /><span>Este é um pagamento simulado.<br /><span>Nenhum valor será cobrado.</span></span></p>
            ) : null}
            <div className="payment-dialog__actions">
                {success ? <button ref={successButtonRef} type="button" className="payment-dialog__primary" onClick={onClose}>Voltar aos pagamentos</button> : busy ? (
                    <p role="status">Aguarde a confirmação do pagamento.</p>
                ) : state.phase === "confirm" ? (
                    <>
                        <button type="button" data-initial-focus onClick={onClose}>Cancelar</button>
                        <button type="button" className="payment-dialog__primary" onClick={onConfirm}>Confirmar pagamento <FiArrowRight aria-hidden="true" /></button>
                    </>
                ) : state.phase === "error" ? (
                    <>
                        <button ref={errorButtonRef} type="button" onClick={onClose}>Fechar</button>
                        {payment.status !== "CANCELLED" ? <button type="button" className="payment-dialog__primary" onClick={onRefresh}>Conferir pagamento</button> : null}
                    </>
                ) : <button type="button" onClick={onClose}>Cancelar</button>}
            </div>
            {staged ? <p className="payment-dialog__footnote">{success ? "Simulação concluída · Nenhum valor foi cobrado" : "Ambiente de demonstração"}</p> : null}
        </dialog>
    );
}
