import type { Payment, PaymentFilter, PaymentSummary } from "../types/payment";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
const periodFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });

export function formatPaymentAmount(amount: number): string {
    return currencyFormatter.format(amount);
}

export function formatPaymentDate(date: string): string {
    return dateFormatter.format(new Date(date.slice(0, 10) + "T12:00:00Z"));
}

export function formatPaymentPeriod(payment: Payment): string {
    const start = payment.billingPeriodStart.slice(0, 7);
    const end = payment.billingPeriodEnd.slice(0, 7);
    return start === end
        ? periodFormatter.format(new Date(payment.billingPeriodStart + "T12:00:00Z"))
        : formatPaymentDate(payment.billingPeriodStart) + " a " + formatPaymentDate(payment.billingPeriodEnd);
}

export function isPendingPayment(payment: Payment): boolean {
    return payment.status === "PENDING" || payment.status === "OVERDUE";
}

export function isOverduePayment(payment: Payment, today = new Date()): boolean {
    const localDate = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, "0"), String(today.getDate()).padStart(2, "0")].join("-");
    return payment.status === "OVERDUE" || payment.status === "PENDING" && payment.dueDate < localDate;
}

export function filterPayments(payments: ReadonlyArray<Payment>, filter: PaymentFilter): ReadonlyArray<Payment> {
    return payments.filter((payment) => filter === "all" || (filter === "pending" ? isPendingPayment(payment) : payment.status === "PAID"));
}

export function summarizePayments(payments: ReadonlyArray<Payment>): PaymentSummary {
    const pending = payments.filter(isPendingPayment);
    const paid = payments.filter((payment) => payment.status === "PAID");
    return {
        total: payments.length,
        pendingCount: pending.length,
        paidCount: paid.length,
        pendingAmount: pending.reduce((total, payment) => total + Math.round(payment.amount * 100), 0) / 100,
        paidAmount: paid.reduce((total, payment) => total + Math.round(payment.amount * 100), 0) / 100,
        nextPayment: [...pending].sort((left, right) => left.dueDate.localeCompare(right.dueDate) || left.id - right.id)[0] ?? null,
    };
}
