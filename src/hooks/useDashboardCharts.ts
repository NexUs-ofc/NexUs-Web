import { useMemo } from "react";
import type { DashboardData } from "../types/dashboard";
import type { DashboardChartModel } from "../types/dashboardChart";
import { buildDashboardCharts } from "../utils/dashboardCharts";

export function useDashboardCharts(data: DashboardData | null): ReadonlyArray<DashboardChartModel> {
    // Agrupamentos, ordenação e opções mantêm a referência enquanto os dados não mudarem.
    // Assim os cards memoizados não reinicializam sete instâncias de gráfico em renders alheios aos dados.
    return useMemo(() => data ? buildDashboardCharts(data) : [], [data]);
}
