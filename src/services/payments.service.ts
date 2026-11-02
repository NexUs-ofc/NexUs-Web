import type { Payment, PaymentStatus } from "../types/payment";
import { toValidatedPayment, toValidatedPayments, validatePaymentId } from "../utils/validatePayments";
import { coreRequest } from "./coreClient";

interface PaymentRequestOptions {
    signal?: AbortSignal;
}

interface PaymentsListOptions extends PaymentRequestOptions {
    status?: PaymentStatus;
}

const paymentsPath = "/api/companies/me/payments";

export async function getPayments(options: PaymentsListOptions = {}): Promise<Payment[]> {
    const { status, ...request } = options;
    const data = await coreRequest<unknown>(paymentsPath + (status ? "?status=" + encodeURIComponent(status) : ""), request);
    return toValidatedPayments(data);
}

export async function getPayment(id: number, options: PaymentRequestOptions = {}): Promise<Payment> {
    const payment = toValidatedPayment(await coreRequest<unknown>(paymentsPath + "/" + validatePaymentId(id), options));
    if (payment.id !== id) throw new Error("O servidor retornou uma cobrança diferente da selecionada.");
    return payment;
}

export async function payPayment(id: number, options: PaymentRequestOptions = {}): Promise<Payment> {
    const payment = toValidatedPayment(await coreRequest<unknown>(paymentsPath + "/" + validatePaymentId(id) + "/pay", {
        ...options,
        method: "POST",
    }));
    if (payment.id !== id || payment.status !== "PAID") {
        throw new Error("Não foi possível confirmar a baixa da cobrança. Confira o pagamento antes de tentar novamente.");
    }
    return payment;
}
