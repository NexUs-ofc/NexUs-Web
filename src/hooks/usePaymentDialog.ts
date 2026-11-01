import { useCallback, useEffect, useRef, useState } from "react";
import type { Payment, PaymentDialogState } from "../types/payment";
import { getPayment, payPayment } from "../services/payments.service";
import { isPendingPayment } from "../utils/paymentFilters";

const PAYMENT_REQUEST_TIMEOUT_MS = 30_000;

export function usePaymentDialog(onUpdated: (payment: Payment) => void) {
    const [state, setState] = useState<PaymentDialogState>({ phase: "closed" });
    const request = useRef<{ controller: AbortController; paying: boolean } | null>(null);

    useEffect(() => () => request.current?.controller.abort(), []);

    const execute = useCallback(async (payment: Payment, paying: boolean): Promise<void> => {
        if (request.current) return;
        const controller = new AbortController();
        const timeout = AbortSignal.timeout(PAYMENT_REQUEST_TIMEOUT_MS);
        const signal = AbortSignal.any([controller.signal, timeout]);
        request.current = { controller, paying };
        setState({ phase: paying ? "processing" : "loading", payment });
        try {
            const updated = paying ? await payPayment(payment.id, { signal }) : await getPayment(payment.id, { signal });
            signal.throwIfAborted();
            onUpdated(updated);
            if (updated.status === "PAID") setState({ phase: "success", payment: updated });
            else if (isPendingPayment(updated)) setState({ phase: "confirm", payment: updated });
            else setState({ phase: "error", payment: updated, message: "Esta cobrança foi cancelada e não pode ser paga." });
        } catch (cause) {
            if (!controller.signal.aborted) setState({
                phase: "error",
                payment,
                message: timeout.aborted
                    ? "O servidor demorou para responder. Confira o pagamento antes de tentar novamente."
                    : cause instanceof Error ? cause.message : "Não foi possível confirmar o pagamento.",
            });
        } finally {
            if (request.current?.controller === controller) request.current = null;
        }
    }, [onUpdated]);

    const open = useCallback((payment: Payment): void => { void execute(payment, false); }, [execute]);
    const confirm = useCallback((): void => {
        if (state.phase === "confirm" && isPendingPayment(state.payment)) void execute(state.payment, true);
    }, [execute, state]);
    const refresh = useCallback((): void => {
        if (state.phase === "error") void execute(state.payment, false);
    }, [execute, state]);
    const close = useCallback((): void => {
        if (request.current?.paying) return;
        request.current?.controller.abort();
        request.current = null;
        setState({ phase: "closed" });
    }, []);

    return { state, open, confirm, refresh, close };
}
