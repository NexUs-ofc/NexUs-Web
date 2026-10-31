import type { DashboardData, WasteLevel } from "../types/dashboard";
import type { DashboardChartModel, ChartLegendItem, ChartTable } from "../types/dashboardChart";
import type { DashboardChartOption } from "./chartEngine";
import { formatDashboardItems, formatDashboardNumber as formatNumber, formatDashboardPercent as formatPercent } from "./dashboardFormatters";
import { consumptionColors } from "./dashboardColors";

export const CHART_COLORS = { primary: "#4f2078", medium: "#9476b4", light: "#c4b3d7", pale: "#d9cfe5", text: "#596273", grid: "#e8eaf0", border: "#7b5799" };
const palette = [CHART_COLORS.primary, CHART_COLORS.medium, CHART_COLORS.light, "#6d448d", CHART_COLORS.pale];
export const WASTE_LEVELS: Record<WasteLevel, { color: string; label: string }> = {
    highest: { color: CHART_COLORS.primary, label: "UF com maior taxa de desperdício" },
    intermediate: { color: CHART_COLORS.medium, label: "UF com taxa intermediária" },
    average: { color: CHART_COLORS.light, label: "UF com taxa média" },
    lowest: { color: CHART_COLORS.pale, label: "UF com taxa mais baixa" },
};

function base(description: string): DashboardChartOption {
    return {
        animation: false,
        textStyle: { fontFamily: "Montserrat, sans-serif", fontSize: 11, color: CHART_COLORS.text },
        aria: { enabled: true, label: { description } },
        // Tooltips desenhados como texto em SVG; nenhum HTML externo é interpretado.
        tooltip: { trigger: "item", renderMode: "richText", confine: true, backgroundColor: "#ffffff", borderColor: "#e5e7eb", textStyle: { color: "#0f172a", fontSize: 12 } },
    };
}

function table(columns: ReadonlyArray<{ id: string; label: string }>, rows: ChartTable["rows"]): ChartTable { return { columns, rows }; }
function legend(id: string, label: string, color: string, dashed = false): ChartLegendItem { return { id, label, color, dashed }; }

function monthlyChart(data: DashboardData): DashboardChartModel {
    const target = formatPercent(data.monthlyTarget);
    const title = `Taxa de desperdício por mês × meta de ${target}`;
    return {
        id: "monthly-waste", title, description: `Meta mensal: ${target} do volume vendido.`, empty: data.monthlyWaste.length === 0,
        option: {
            ...base(`${title}. Valores por mês disponíveis na tabela.`),
            grid: { left: 38, right: 12, top: 16, bottom: 32 },
            xAxis: { type: "category", boundaryGap: false, data: data.monthlyWaste.map((item) => item.month), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontSize: 10, interval: 0 } },
            yAxis: { type: "value", min: 0, max: Math.max(25, Math.ceil(Math.max(data.monthlyTarget, ...data.monthlyWaste.map((item) => item.rate)) / 5) * 5), interval: 5, axisLabel: { formatter: "{value}%", fontSize: 10 }, splitLine: { lineStyle: { color: CHART_COLORS.grid } } },
            series: [{
                type: "line", name: "Taxa de desperdício mensal", data: data.monthlyWaste.map((item) => item.rate),
                symbol: "circle", symbolSize: 5, lineStyle: { width: 2, color: CHART_COLORS.primary }, itemStyle: { color: CHART_COLORS.primary },
                tooltip: { valueFormatter: (value) => `${formatNumber(Number(value))}%` },
                markLine: { silent: true, symbol: "none", label: { show: false }, lineStyle: { type: "dashed", color: "#b7791f", width: 1.5 }, data: [{ yAxis: data.monthlyTarget }] },
            }],
        },
        legend: [legend("rate", "Taxa de desperdício mensal", CHART_COLORS.primary), legend("target", `Meta: ${target} (linha tracejada)`, "#b7791f", true)],
        axisNotes: [{ id: "y", text: "Eixo Y: taxa (%)" }, { id: "x", text: "Eixo X: meses do ano" }],
        table: table([{ id: "month", label: "Mês" }, { id: "rate", label: "Taxa de desperdício" }, { id: "target", label: "Meta mensal" }], data.monthlyWaste.map((item) => ({ id: item.id, cells: [item.month, formatPercent(item.rate), target] }))),
    };
}

function stateChart(data: DashboardData): DashboardChartModel {
    return {
        id: "state-waste", title: "Desperdício por UF", description: "UF com maior taxa de desperdício no período.", empty: data.stateWaste.length === 0,
        option: {
            ...base("Mapa do Brasil com as classes de desperdício por UF. A classificação de cada estado está disponível na tabela."),
            series: [{
                type: "map", map: "nexus-brazil", roam: false, selectedMode: false, layoutCenter: ["50%", "49%"], layoutSize: "96%",
                label: { show: true, fontSize: 9, color: "#20102e" }, labelLayout: { hideOverlap: true },
                itemStyle: { areaColor: "#e5e7eb", borderColor: CHART_COLORS.border, borderWidth: 0.6 },
                emphasis: { label: { color: "#ffffff" }, itemStyle: { areaColor: "#65358c", borderColor: CHART_COLORS.primary, borderWidth: 1.5 } },
                tooltip: { formatter: (params) => {
                    const entry = Array.isArray(params) ? params[0] : params;
                    const state = data.stateWaste.find((item) => item.id === entry.name);
                    return state ? `${state.name} (${state.id})\n${WASTE_LEVELS[state.level].label}` : "Sem dados";
                } },
                data: data.stateWaste.map((item) => ({ name: item.id, itemStyle: { areaColor: WASTE_LEVELS[item.level].color }, label: { color: item.level === "highest" ? "#ffffff" : "#000000" } })),
            }],
        },
        legend: Object.entries(WASTE_LEVELS).map(([id, item]) => legend(id, item.label, item.color)),
        note: "Escala ilustrativa: claro = menor / escuro = maior (sem intervalos numéricos definidos)",
        axisNotes: [{ id: "map", text: "Mapa do Brasil por UF · taxa de desperdício" }],
        table: table([{ id: "state", label: "UF" }, { id: "name", label: "Estado" }, { id: "level", label: "Classificação ilustrativa" }], data.stateWaste.map((item) => ({ id: item.id, cells: [item.id, item.name, WASTE_LEVELS[item.level].label] }))),
    };
}

function regionalChart(data: DashboardData): DashboardChartModel {
    const categories = data.categories.filter((category) => data.regionalWaste.some((item) => item.categoryId === category.id));
    const values = new Map(data.regionalWaste.map((item) => [JSON.stringify([item.regionId, item.categoryId]), item.volume]));
    return {
        id: "regional-waste", title: "Categorias desperdiçadas por região", description: "Barras empilhadas por região.", empty: data.regionalWaste.length === 0,
        option: {
            ...base("Volume desperdiçado por categoria em cada região do Brasil. Valores disponíveis na tabela."),
            grid: { left: 100, right: 16, top: 10, bottom: 30 },
            xAxis: { type: "value", show: false },
            yAxis: { type: "category", inverse: true, data: data.regions.map((item) => item.name), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontSize: 10 } },
            series: categories.map((category, index) => ({
                type: "bar", name: category.name, stack: "waste", barWidth: 22,
                itemStyle: { color: palette[index % palette.length], borderColor: CHART_COLORS.border, borderWidth: 0.6 },
                data: data.regions.map((region) => values.get(JSON.stringify([region.id, category.id])) ?? null),
            })),
        },
        legend: categories.map((item, index) => legend(item.id, item.name, palette[index % palette.length])),
        axisNotes: [{ id: "y", text: "Eixo Y: regiões do Brasil" }, { id: "x", text: "Comprimento das barras: volume desperdiçado" }],
        table: table([{ id: "region", label: "Região" }, ...categories.map((item) => ({ id: item.id, label: item.name }))], data.regions.map((region) => ({ id: region.id, cells: [region.name, ...categories.map((category) => { const value = values.get(JSON.stringify([region.id, category.id])); return value === undefined ? "Sem dados" : formatNumber(value); })] }))),
    };
}

function consumptionChart(data: DashboardData): DashboardChartModel {
    const maximum = Math.max(1, ...data.regionalConsumption.map((item) => item.kilograms));
    const categoryIndex = new Map(data.categories.map((item, index) => [item.id, index]));
    const regionIndex = new Map(data.regions.map((item, index) => [item.id, index]));
    return {
        id: "regional-consumption", title: "Consumo categoria × região", description: "Heatmap de consumo por categoria e região.", empty: data.regionalConsumption.length === 0,
        option: {
            ...base("Consumo em quilogramas por categoria e região do Brasil. Cada célula contém seu valor, também disponível na tabela."),
            grid: { left: 91, right: 12, top: 30, bottom: 26 },
            xAxis: { type: "category", position: "top", data: data.regions.map((item) => item.abbreviation), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontSize: 10 } },
            yAxis: { type: "category", inverse: true, data: data.categories.map((item) => item.name), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontSize: 10 } },
            visualMap: { show: false, min: 0, max: maximum, inRange: { color: [CHART_COLORS.pale, CHART_COLORS.light, CHART_COLORS.medium, CHART_COLORS.primary] } },
            series: [{
                type: "heatmap", name: "Consumo (itens)",
                itemStyle: { borderWidth: 2, borderColor: "#ffffff" }, emphasis: { itemStyle: { borderColor: CHART_COLORS.primary } },
                label: { show: true, fontSize: 10, formatter: (params) => Array.isArray(params.value) ? formatNumber(Number(params.value[2])) : "" },
                tooltip: { formatter: (params) => {
                    const entry = Array.isArray(params) ? params[0] : params;
                    if (!Array.isArray(entry.value)) return "Sem dados";
                    return `${data.categories[Number(entry.value[1])]?.name ?? ""} · ${data.regions[Number(entry.value[0])]?.name ?? ""}\n${formatDashboardItems(Number(entry.value[2]))}`;
                } },
                data: data.regionalConsumption.map((item) => {
                    const colors = consumptionColors(item.kilograms, maximum);
                    return { value: [regionIndex.get(item.regionId) ?? 0, categoryIndex.get(item.categoryId) ?? 0, item.kilograms], itemStyle: { color: colors.fill }, label: { color: colors.text } };
                }),
            }],
        },
        legend: [legend("high", "Consumo alto (itens)", CHART_COLORS.primary), legend("medium", "Consumo médio (itens)", CHART_COLORS.medium), legend("low", "Consumo baixo (itens)", CHART_COLORS.light), legend("minimum", "Consumo mínimo (itens)", CHART_COLORS.pale)],
        axisNotes: [{ id: "x", text: "Eixo X: regiões do Brasil" }, { id: "y", text: "Eixo Y: categorias de produto" }],
        note: "Consumo (itens) · claro = menor / escuro = maior",
        table: table([{ id: "category", label: "Categoria" }, { id: "region", label: "Região" }, { id: "consumption", label: "Consumo (itens)" }], data.regionalConsumption.map((item) => ({ id: item.id, cells: [data.categories.find((category) => category.id === item.categoryId)?.name ?? "", data.regions.find((region) => region.id === item.regionId)?.name ?? "", formatDashboardItems(item.kilograms)] }))),
    };
}

function histogramChart(data: DashboardData): DashboardChartModel {
    return {
        id: "shelf-life-distribution", title: "Vida útil no cadastro", description: "Histograma da vida útil dos itens cadastrados.", empty: data.shelfLifeDistribution.length === 0,
        option: {
            ...base("Frequência de itens por faixa de vida útil em dias. Valores disponíveis na tabela."),
            grid: { left: 38, right: 12, top: 16, bottom: 36 },
            xAxis: { type: "category", data: data.shelfLifeDistribution.map((item) => item.label), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontSize: 10, interval: 0 } },
            yAxis: { type: "value", min: 0, max: Math.max(700, Math.ceil(Math.max(0, ...data.shelfLifeDistribution.map((item) => item.count)) / 100) * 100), axisLabel: { fontSize: 10 }, splitLine: { lineStyle: { color: CHART_COLORS.grid } } },
            series: [{ type: "bar", name: "Frequência de itens", barCategoryGap: "5%", data: data.shelfLifeDistribution.map((item) => item.count), itemStyle: { color: CHART_COLORS.medium, borderColor: CHART_COLORS.border, borderWidth: 0.6 } }],
        },
        legend: [legend("frequency", "Frequência de itens por faixa de vida útil", CHART_COLORS.medium)],
        axisNotes: [{ id: "y", text: "Eixo Y: frequência (contagem)" }, { id: "x", text: "Eixo X: faixas de vida útil (dias)" }],
        table: table([{ id: "bucket", label: "Vida útil (dias)" }, { id: "count", label: "Frequência de itens" }], data.shelfLifeDistribution.map((item) => ({ id: item.id, cells: [item.label, formatNumber(item.count)] }))),
    };
}

function shelfLifeChart(data: DashboardData): DashboardChartModel {
    const names = new Map(data.categories.map((item) => [item.id, item.name]));
    const maximum = Math.max(90, Math.ceil(Math.max(0, ...data.categoryShelfLife.map((item) => item.maximum)) / 10) * 10);
    return {
        id: "category-shelf-life", title: "Vida útil por categoria", description: "Boxplot da vida útil por categoria.", empty: data.categoryShelfLife.length === 0,
        option: {
            ...base("Distribuição da vida útil por categoria: limites inferior e superior, primeiro quartil, mediana e terceiro quartil, em dias. Valores disponíveis na tabela."),
            grid: { left: 91, right: 16, top: 16, bottom: 30 },
            xAxis: { type: "value", min: 0, max: maximum, interval: maximum / 2, axisLabel: { fontSize: 10 }, splitLine: { lineStyle: { color: CHART_COLORS.grid } } },
            yAxis: { type: "category", inverse: true, data: data.categoryShelfLife.map((item) => names.get(item.categoryId) ?? item.categoryId), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontSize: 10 } },
            series: [{ type: "boxplot", name: "Vida útil (dias)", layout: "horizontal", boxWidth: [12, 18], itemStyle: { color: CHART_COLORS.light, borderColor: CHART_COLORS.border, borderWidth: 1.5 },
                data: data.categoryShelfLife.map((item) => [item.minimum, item.firstQuartile, item.median, item.thirdQuartile, item.maximum]),
                tooltip: { formatter: (params) => {
                    const entry = Array.isArray(params) ? params[0] : params;
                    const item = data.categoryShelfLife[entry.dataIndex];
                    return item ? `${names.get(item.categoryId) ?? ""}\nMínimo: ${formatNumber(item.minimum)} dias\nQ1: ${formatNumber(item.firstQuartile)} dias\nMediana: ${formatNumber(item.median)} dias\nQ3: ${formatNumber(item.thirdQuartile)} dias\nMáximo: ${formatNumber(item.maximum)} dias` : "Sem dados";
                } },
            }],
        },
        legend: [legend("min", "Extremidade esquerda: limite inferior", CHART_COLORS.medium), legend("q1", "Quartil 1 (Q1)", CHART_COLORS.light), legend("median", "Mediana (Q2)", CHART_COLORS.primary), legend("q3", "Quartil 3 (Q3)", CHART_COLORS.light), legend("max", "Extremidade direita: limite superior", CHART_COLORS.medium)],
        axisNotes: [{ id: "x", text: "Eixo X: vida útil (dias)" }, { id: "y", text: "Eixo Y: categorias de produto" }],
        table: table([{ id: "category", label: "Categoria" }, { id: "min", label: "Mínimo (dias)" }, { id: "q1", label: "Q1 (dias)" }, { id: "median", label: "Mediana (dias)" }, { id: "q3", label: "Q3 (dias)" }, { id: "max", label: "Máximo (dias)" }], data.categoryShelfLife.map((item) => ({ id: item.id, cells: [names.get(item.categoryId) ?? "", ...[item.minimum, item.firstQuartile, item.median, item.thirdQuartile, item.maximum].map(formatNumber)] }))),
    };
}

function belowMinimumChart(data: DashboardData): DashboardChartModel {
    const items = [...data.belowMinimum].sort((a, b) => b.missingVolume - a.missingVolume).slice(0, 10);
    return {
        id: "below-minimum", title: "Top 10 abaixo do mínimo", description: "Barras do top 10 de itens abaixo do mínimo.", fullWidth: true, empty: items.length === 0,
        option: {
            ...base("Os dez itens com maior volume abaixo do mínimo, em ordem decrescente. Valores disponíveis na tabela."),
            grid: { left: 145, right: 35, top: 6, bottom: 22 },
            xAxis: { type: "value", show: false },
            yAxis: { type: "category", inverse: true, data: items.map((item) => item.name), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { fontSize: 11, width: 135, overflow: "truncate" } },
            series: [{ type: "bar", name: "Volume abaixo do mínimo", barWidth: 16, data: items.map((item) => item.missingVolume), itemStyle: { color: CHART_COLORS.medium, borderColor: CHART_COLORS.border, borderWidth: 0.6 }, label: { show: true, position: "right", fontSize: 10, color: CHART_COLORS.text } }],
        },
        legend: [legend("volume", "Volume abaixo do mínimo por item", CHART_COLORS.medium)],
        axisNotes: [{ id: "y", text: "Eixo Y: itens do top 10" }, { id: "x", text: "Eixo X: volume abaixo do mínimo" }],
        table: table([{ id: "item", label: "Item" }, { id: "volume", label: "Volume abaixo do mínimo" }], items.map((item) => ({ id: item.id, cells: [item.name, formatNumber(item.missingVolume)] }))),
    };
}

export function buildDashboardCharts(data: DashboardData): ReadonlyArray<DashboardChartModel> {
    return [monthlyChart(data), stateChart(data), regionalChart(data), consumptionChart(data), histogramChart(data), shelfLifeChart(data), belowMinimumChart(data)];
}
