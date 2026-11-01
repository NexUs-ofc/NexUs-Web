import { useCallback, useEffect, useMemo, useState } from "react";
import type { PaymentFilter } from "../types/payment";
import { filterPayments, summarizePayments } from "../utils/paymentFilters";
import { usePayments } from "./usePayments";
import { usePlans } from "./usePlans";
import { usePaymentDialog } from "./usePaymentDialog";

export function usePaymentsPage() {
    const collection = usePayments();
    const catalog = usePlans();
    const dialog = usePaymentDialog(collection.updatePayment);
    const [status, setStatus] = useState<PaymentFilter>("all");
    const payments = useMemo(() => filterPayments(collection.payments, status), [collection.payments, status]);
    const summary = useMemo(() => summarizePayments(collection.payments), [collection.payments]);
    const planNames = useMemo(() => new Map(catalog.plans.map((plan) => [plan.id, plan.title])), [catalog.plans]);
    const reloadPayments = collection.reload;
    const reloadPlans = catalog.reload;
    const reload = useCallback((): void => { reloadPayments(); reloadPlans(); }, [reloadPayments, reloadPlans]);

    useEffect(() => { document.title = "Pagamentos — NexUs"; }, []);

    return {
        payments,
        summary,
        status,
        setStatus,
        planNames,
        dialog,
        loading: collection.loading || catalog.loading,
        error: collection.error,
        plansError: catalog.error,
        reload,
        reloadPlans: catalog.reload,
        hasPayments: collection.payments.length > 0,
    };
}
