import type { DashboardChartModel } from "../../types/dashboardChart";
import DashboardChartCard from "../DashboardChartCard";

export interface DashboardChartsGridProps { charts: ReadonlyArray<DashboardChartModel>; mapSource: string; }

export default function DashboardChartsGrid({ charts, mapSource }: DashboardChartsGridProps) {
    const visible = charts.filter((model) => !model.empty);
    if (visible.length === 0) return null;
    return (
        <div className="dashboard-charts">
            {visible.map((model) => <DashboardChartCard key={model.id} model={model} mapSource={model.id === "state-waste" ? mapSource : undefined} />)}
        </div>
    );
}
