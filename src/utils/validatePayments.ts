import type { Payment, PaymentStatus } from "../types/payment";
import { asRecord } from "./responseParsers";

const paymentStatuses: ReadonlyArray<PaymentStatus> = ["PENDING", "PAID", "OVERDUE", "CANCELLED"];

export function validatePaymentId(value: unknown): number {
    if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) {
        throw new Error("Identificador do pagamento inválido.");
    }
    return value;
}

function paymentDate(value: unknown): string {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/u.test(value)) {
        throw new Error("Data do pagamento inválida.");
    }
    const date = new Date(value + "T12:00:00Z");
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
        throw new Error("Data do pagamento inválida.");
    }
    return value;
}

function paymentTimestamp(value: unknown): string | null {
    if (value === null) return null;
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?$/u.test(value)) {
        throw new Error("Data de confirmação do pagamento inválida.");
    }
    paymentDate(value.slice(0, 10));
    if (!Number.isFinite(Date.parse(value))) throw new Error("Data de confirmação do pagamento inválida.");
    return value;
}

export function toValidatedPayment(value: unknown): Payment {
    const data = asRecord(value);
    const { amount, paymentStatus } = data;
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0 || amount > 99_999_999.99
        || Math.abs(amount * 100 - Math.round(amount * 100)) > 0.00001) {
        throw new Error("Valor do pagamento inválido.");
    }
    if (!paymentStatuses.includes(paymentStatus as PaymentStatus)) throw new Error("Status do pagamento inválido.");
    const billingPeriodStart = paymentDate(data.billingPeriodStart);
    const billingPeriodEnd = paymentDate(data.billingPeriodEnd);
    if (billingPeriodEnd < billingPeriodStart) throw new Error("Período de cobrança inválido.");
    return {
        id: validatePaymentId(data.id),
        companyId: validatePaymentId(data.companyId),
        planId: validatePaymentId(data.planId),
        amount,
        dueDate: paymentDate(data.dueDate),
        billingPeriodStart,
        billingPeriodEnd,
        status: paymentStatus as PaymentStatus,
        paidAt: paymentTimestamp(data.paidAt),
    };
}

export function toValidatedPayments(value: unknown): Payment[] {
    if (!Array.isArray(value)) throw new Error("Não foi possível interpretar a lista de pagamentos.");
    const payments = value.map(toValidatedPayment);
    if (new Set(payments.map((payment) => payment.id)).size !== payments.length) {
        throw new Error("A lista de pagamentos contém cobranças duplicadas.");
    }
    return payments.sort((left, right) => right.dueDate.localeCompare(left.dueDate) || right.id - left.id);
}
