import { useRef } from "react";
import { useDashboardChart } from "../../hooks/useDashboardChart";
import type { DashboardChartOption } from "../../utils/chartEngine";
import ErrorAlert from "../ErrorAlert";

export interface DashboardChartProps {
    title: string;
    option: DashboardChartOption;
    mapSource?: string;
}

export default function DashboardChart({ title, option, mapSource }: DashboardChartProps) {
    const container = useRef<HTMLDivElement>(null);
    const error = useDashboardChart(container, option, mapSource);
    return (
        <>
            <div ref={container} className="dashboard-chart" role="img" aria-label={`${title}. Valores disponíveis no botão Ver dados.`} />
            {error ? <ErrorAlert title="Gráfico indisponível" message={error} /> : null}
        </>
    );
}
