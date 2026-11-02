import { useCallback, useEffect, useState } from "react";
import type { Payment } from "../types/payment";
import { getPayments } from "../services/payments.service";

export function usePayments() {
    const [state, setState] = useState({ payments: [] as ReadonlyArray<Payment>, error: "", revision: 0, settledRevision: -1 });
    const { revision } = state;

    useEffect(() => {
        const controller = new AbortController();
        void getPayments({ signal: controller.signal }).then((payments) => {
            if (!controller.signal.aborted) setState((previous) => ({ ...previous, payments, error: "", settledRevision: revision }));
        }).catch((cause: unknown) => {
            if (!controller.signal.aborted) setState((previous) => ({
                ...previous,
                error: cause instanceof Error ? cause.message : "Não foi possível carregar os pagamentos.",
                settledRevision: revision,
            }));
        });
        return () => controller.abort();
    }, [revision]);

    const reload = useCallback((): void => {
        setState((previous) => ({ ...previous, revision: previous.revision + 1 }));
    }, []);

    const updatePayment = useCallback((payment: Payment): void => {
        setState((previous) => ({
            ...previous,
            payments: previous.payments.map((item) => item.id === payment.id ? payment : item),
        }));
    }, []);

    return {
        payments: state.payments,
        loading: state.revision !== state.settledRevision,
        error: state.revision === state.settledRevision ? state.error : "",
        reload,
        updatePayment,
    };
}
