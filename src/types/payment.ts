export type PaymentStatus = "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";

export type PaymentFilter = "all" | "pending" | "paid";

export interface Payment {
    id: number;
    companyId: number;
    planId: number;
    amount: number;
    dueDate: string;
    billingPeriodStart: string;
    billingPeriodEnd: string;
    status: PaymentStatus;
    paidAt: string | null;
}

export interface PaymentSummary {
    total: number;
    pendingCount: number;
    paidCount: number;
    pendingAmount: number;
    paidAmount: number;
    nextPayment: Payment | null;
}

export type PaymentDialogState =
    | { phase: "closed" }
    | { phase: "loading" | "confirm" | "processing" | "success"; payment: Payment }
    | { phase: "error"; payment: Payment; message: string };
