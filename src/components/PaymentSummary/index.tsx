import type { PaymentSummary as Summary } from "../../types/payment";
import { formatPaymentAmount, formatPaymentDate, isOverduePayment } from "../../utils/paymentFilters";

export interface PaymentSummaryProps {
    summary: Summary;
}

export default function PaymentSummary({ summary }: PaymentSummaryProps) {
    const next = summary.nextPayment;
    return (
        <dl className="payments-summary" aria-label="Resumo dos pagamentos">
            <div className="payments-summary__card">
                <dt>Em aberto</dt>
                <dd className="payments-summary__amount">{formatPaymentAmount(summary.pendingAmount)}</dd>
                <dd>{summary.pendingCount === 0 ? "Nenhuma cobrança pendente" : summary.pendingCount === 1 ? "1 cobrança aguardando pagamento" : summary.pendingCount + " cobranças aguardando pagamento"}</dd>
            </div>
            <div className="payments-summary__card">
                <dt>Já pagos</dt>
                <dd className="payments-summary__amount payments-summary__amount--paid">{formatPaymentAmount(summary.paidAmount)}</dd>
                <dd>{summary.paidCount} {summary.paidCount === 1 ? "pagamento concluído" : "pagamentos concluídos"}</dd>
            </div>
            <div className="payments-summary__card payments-summary__card--next">
                <dt>{next ? isOverduePayment(next) ? "Cobrança em atraso" : "Próximo vencimento" : "Tudo em dia"}</dt>
                <dd className="payments-summary__date">{next ? <time dateTime={next.dueDate}>{formatPaymentDate(next.dueDate)}</time> : "Sem pendências"}</dd>
                <dd>{next ? "Confira os detalhes da cobrança abaixo" : "Não há cobranças em aberto"}</dd>
            </div>
        </dl>
    );
}
