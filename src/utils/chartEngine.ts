import { init, registerMap, use as registerChartModules } from "echarts/core";
import type { ComposeOption, EChartsType } from "echarts/core";
import { BarChart, BoxplotChart, HeatmapChart, LineChart, MapChart } from "echarts/charts";
import type { BarSeriesOption, BoxplotSeriesOption, HeatmapSeriesOption, LineSeriesOption, MapSeriesOption } from "echarts/charts";
import { AriaComponent, GridComponent, MarkLineComponent, TooltipComponent, VisualMapComponent } from "echarts/components";
import type { AriaComponentOption, GridComponentOption, MarkLineComponentOption, TooltipComponentOption, VisualMapComponentOption } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";
import { LabelLayout } from "echarts/features";

registerChartModules([BarChart, BoxplotChart, HeatmapChart, LineChart, MapChart, AriaComponent, GridComponent, MarkLineComponent, TooltipComponent, VisualMapComponent, SVGRenderer, LabelLayout]);

export type DashboardChartOption = ComposeOption<BarSeriesOption | BoxplotSeriesOption | HeatmapSeriesOption | LineSeriesOption | MapSeriesOption | AriaComponentOption | GridComponentOption | MarkLineComponentOption | TooltipComponentOption | VisualMapComponentOption>;

export function createDashboardChart(element: HTMLDivElement, mapSource?: string): EChartsType {
    if (mapSource) registerMap("nexus-brazil", mapSource);
    return init(element, undefined, { renderer: "svg" });
}
