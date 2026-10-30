import type { CSSProperties } from "react";
import type { ChartLegendItem } from "../../types/dashboardChart";

export interface DashboardChartLegendProps { items: ReadonlyArray<ChartLegendItem>; }

export default function DashboardChartLegend({ items }: DashboardChartLegendProps) {
    return (
        <ul className="dashboard-legend" aria-label="Legenda">
            {items.map((item) => (
                <li key={item.id}>
                    <span className={`dashboard-legend__swatch${item.dashed ? " dashboard-legend__swatch--dashed" : ""}`} style={{ "--swatch-color": item.color } as CSSProperties} aria-hidden="true" />
                    <span>{item.label}</span>
                </li>
            ))}
        </ul>
    );
}
