import type { DashboardSummary as Summary } from "../../types/dashboard";
import { formatDashboardItems, formatDashboardPercent } from "../../utils/dashboardFormatters";
import DashboardStatCard from "../DashboardStatCard";

export interface DashboardSummaryProps { summary: Summary; }

export default function DashboardSummary({ summary }: DashboardSummaryProps) {
    return (
        <dl className="dashboard-summary" aria-label="Resumo dos indicadores">
            <DashboardStatCard label="Desperdício" value={formatDashboardPercent(summary.wasteRate)} />
            <DashboardStatCard label="Vencidos" value={formatDashboardItems(summary.expiredKg)} />
            <DashboardStatCard label="A vencer em 7 dias" value={formatDashboardItems(summary.expiringInSevenDaysKg)} />
            <DashboardStatCard label="Sem validade" value={formatDashboardItems(summary.withoutExpiryKg)} />
        </dl>
    );
}
