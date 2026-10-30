import type { DashboardChartOption } from "../utils/chartEngine";

export interface ChartLegendItem {
    id: string;
    label: string;
    color: string;
    dashed?: boolean;
}

export interface ChartTableRow {
    id: string;
    cells: ReadonlyArray<string>;
}

export interface ChartTable {
    columns: ReadonlyArray<{ id: string; label: string }>;
    rows: ReadonlyArray<ChartTableRow>;
}

export interface DashboardChartModel {
    id: string;
    title: string;
    description: string;
    option: DashboardChartOption;
    table: ChartTable;
    legend: ReadonlyArray<ChartLegendItem>;
    axisNotes: ReadonlyArray<{ id: string; text: string }>;
    note?: string;
    empty: boolean;
    fullWidth?: boolean;
}
