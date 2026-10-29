import type { DashboardChartModel } from "../../types/dashboardChart";
import DashboardChartCard from "../DashboardChartCard";

export interface DashboardChartsGridProps { charts: ReadonlyArray<DashboardChartModel>; mapSource: string; }

export default function DashboardChartsGrid({ charts, mapSource }: DashboardChartsGridProps) {
    return (
        <div className="dashboard-charts">
            {charts.map((model) => <DashboardChartCard key={model.id} model={model} mapSource={model.id === "state-waste" ? mapSource : undefined} />)}
        </div>
    );
}
