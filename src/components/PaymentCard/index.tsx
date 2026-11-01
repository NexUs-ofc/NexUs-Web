import { useId } from "react";
import { FiArrowRight, FiCalendar, FiCheck, FiCreditCard } from "react-icons/fi";
import type { Payment } from "../../types/payment";
import { formatPaymentAmount, formatPaymentDate, formatPaymentPeriod, isOverduePayment, isPendingPayment } from "../../utils/paymentFilters";

export interface PaymentCardProps {
    payment: Payment;
    planName: string;
    onPay: (payment: Payment) => void;
}

export default function PaymentCard({ payment, planName, onPay }: PaymentCardProps) {
    const titleId = useId();
    const paid = payment.status === "PAID";
    const pending = isPendingPayment(payment);
    const status = paid ? "paid" : payment.status === "CANCELLED" ? "cancelled" : isOverduePayment(payment) ? "overdue" : "pending";
    const label = { paid: "Já pago", cancelled: "Cancelado", overdue: "Em atraso", pending: "Pendente" }[status];
    return (
        <article className={"payment-card payment-card--" + status} aria-labelledby={titleId}>
            <header className="payment-card__header">
                <span className="payment-card__icon" aria-hidden="true">{paid ? <FiCheck /> : <FiCreditCard />}</span>
                <div className="payment-card__identity">
                    <h3 id={titleId}>Plano {planName}</h3>
                    <p>{formatPaymentPeriod(payment)}</p>
                </div>
                <span className={"payment-badge payment-badge--" + status}>{label}</span>
            </header>
            <p className="payment-card__amount">{formatPaymentAmount(payment.amount)}</p>
            <p className="payment-card__description">Cobrança mensal</p>
            <footer className="payment-card__footer">
                <p className="payment-card__date">
                    {paid ? <FiCheck aria-hidden="true" /> : <FiCalendar aria-hidden="true" />}
                    {paid ? payment.paidAt ? <>Pago em <time dateTime={payment.paidAt}>{formatPaymentDate(payment.paidAt)}</time></> : "Pagamento confirmado"
                        : <>{pending ? status === "overdue" ? "Vencido em " : "Vence em " : "Vencimento: "}<time dateTime={payment.dueDate}>{formatPaymentDate(payment.dueDate)}</time></>}
                </p>
                {pending ? (
                    <button type="button" className="payment-card__pay" onClick={() => onPay(payment)} aria-label={"Pagar o plano " + planName + ", " + formatPaymentPeriod(payment) + ", " + formatPaymentAmount(payment.amount)}>
                        Pagar <FiArrowRight aria-hidden="true" />
                    </button>
                ) : null}
            </footer>
        </article>
    );
}
