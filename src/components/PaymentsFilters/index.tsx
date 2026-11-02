import type { PaymentFilter, PaymentSummary } from "../../types/payment";

export interface PaymentsFiltersProps {
    status: PaymentFilter;
    summary: PaymentSummary;
    onChange: (status: PaymentFilter) => void;
}

export default function PaymentsFilters({ status, summary, onChange }: PaymentsFiltersProps) {
    const options: ReadonlyArray<{ value: PaymentFilter; label: string; count: number }> = [
        { value: "all", label: "Todos", count: summary.total },
        { value: "pending", label: "Pendentes", count: summary.pendingCount },
        { value: "paid", label: "Já pagos", count: summary.paidCount },
    ];
    return (
        <div className="payments-filters" role="group" aria-label="Filtrar pagamentos por status">
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    aria-pressed={status === option.value}
                    aria-label={option.label + ", " + option.count + (option.count === 1 ? " pagamento" : " pagamentos")}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                    <span aria-hidden="true">{option.count}</span>
                </button>
            ))}
        </div>
    );
}
