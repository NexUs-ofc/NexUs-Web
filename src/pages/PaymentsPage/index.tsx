import { FiCheck, FiCreditCard } from "react-icons/fi";
import ErrorAlert from "../../components/ErrorAlert";
import LoadingSpinner from "../../components/LoadingSpinner";
import PageTitle from "../../components/PageTitle";
import PaymentCard from "../../components/PaymentCard";
import PaymentDialog from "../../components/PaymentDialog";
import PaymentsFilters from "../../components/PaymentsFilters";
import PaymentSummary from "../../components/PaymentSummary";
import { usePaymentsPage } from "../../hooks/usePaymentsPage";
import "../../../styles/pages/PaymentsPage/payments-page.css";

export default function PaymentsPage() {
    const { payments, summary, status, setStatus, planNames, dialog, loading, error, plansError, reload, reloadPlans, hasPayments } = usePaymentsPage();
    const ready = !loading && error === "";
    const emptyTitle = !hasPayments ? "Ainda não há pagamentos" : status === "pending" ? "Nenhum pagamento pendente" : "Nenhum pagamento realizado";
    const emptyDescription = !hasPayments ? "As cobranças dos seus planos aparecerão aqui." : status === "pending" ? "Tudo certo! Não há cobranças em aberto." : "As cobranças quitadas aparecerão aqui.";
    const planName = (planId: number): string => planNames.get(planId) ?? "#" + planId;

    return (
        <main className="portal-page payments-page">
            <header className="payments-page__header">
                <PageTitle id="payments-title">Pagamentos</PageTitle>
                <p>Acompanhe as cobranças do seu plano e mantenha tudo em dia.</p>
            </header>
            {loading ? <LoadingSpinner message="Carregando os pagamentos..." /> : error ? (
                <div className="payments-page__feedback">
                    <ErrorAlert title="Não foi possível carregar os pagamentos" message={error} />
                    <button type="button" className="payments-page__retry" onClick={reload}>Tentar novamente</button>
                </div>
            ) : null}
            {ready ? (
                <>
                    {plansError ? (
                        <div className="payments-page__feedback" role="status">
                            <p>Não foi possível consultar os nomes dos planos. As cobranças estão identificadas pelo número do plano.</p>
                            <button type="button" className="payments-page__retry" onClick={reloadPlans}>Consultar planos novamente</button>
                        </div>
                    ) : null}
                    <PaymentSummary summary={summary} />
                    <section className="payments-history" aria-labelledby="payments-history-title">
                        <h2 id="payments-history-title">Histórico de pagamentos</h2>
                        <PaymentsFilters status={status} summary={summary} onChange={setStatus} />
                        <p className="sr-only" role="status" aria-live="polite">{payments.length} {payments.length === 1 ? "pagamento exibido" : "pagamentos exibidos"}.</p>
                        {payments.length === 0 ? (
                            <div className="payments-empty" role="status">
                                <span aria-hidden="true">{status === "pending" && hasPayments ? <FiCheck /> : <FiCreditCard />}</span>
                                <h3>{emptyTitle}</h3>
                                <p>{emptyDescription}</p>
                            </div>
                        ) : (
                            <div className="payments-grid">
                                {payments.map((payment) => <PaymentCard key={payment.id} payment={payment} planName={planName(payment.planId)} onPay={dialog.open} />)}
                            </div>
                        )}
                    </section>
                    <p className="payments-page__footer">Valores em reais · Cada cobrança identifica o plano contratado naquele período.</p>
                </>
            ) : null}
            {dialog.state.phase !== "closed" ? (
                <PaymentDialog state={dialog.state} planName={planName(dialog.state.payment.planId)} onConfirm={dialog.confirm} onRefresh={dialog.refresh} onClose={dialog.close} />
            ) : null}
        </main>
    );
}
