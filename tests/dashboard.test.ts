import { describe, expect, it, vi } from "vitest";
import type { BarSeriesOption, LineSeriesOption } from "echarts/charts";
import { MOCK_DASHBOARD } from "../src/mocks/dashboard";
import { getDashboard } from "../src/services/dashboard.service";
import { getBrazilStatesMap } from "../src/services/geography.service";
import * as validation from "../src/utils/validateDashboard";
import { buildDashboardCharts } from "../src/utils/dashboardCharts";
import { consumptionColors } from "../src/utils/dashboardColors";

describe("contrato do dashboard", () => {
    it("devolve uma cópia validada, sem permitir mutação dos mocks por consumidores", async () => {
        const data = await getDashboard();
        expect(data).toEqual(MOCK_DASHBOARD);
        expect(data).not.toBe(MOCK_DASHBOARD);
        expect(data.monthlyWaste[0]).not.toBe(MOCK_DASHBOARD.monthlyWaste[0]);
        expect(data.summary).not.toBe(MOCK_DASHBOARD.summary);
    });

    it("preserva o cancelamento sem convertê-lo em erro de carregamento", async () => {
        const controller = new AbortController();
        controller.abort();
        await expect(getDashboard({ signal: controller.signal })).rejects.toMatchObject({ name: "AbortError" });
        await expect(getBrazilStatesMap({ signal: controller.signal })).rejects.toMatchObject({ name: "AbortError" });
    });

    it("oferece um erro compreensível quando o payload é incompatível", async () => {
        const parser = vi.spyOn(validation, "toValidatedDashboard").mockImplementationOnce(() => { throw new Error("Payload inválido"); });
        await expect(getDashboard()).rejects.toThrow("Não foi possível carregar os dados do dashboard");
        parser.mockRestore();
    });

    it("usa uma malha local com todas as 27 UFs, correspondentes ao contrato", async () => {
        const map = JSON.parse(await getBrazilStatesMap()) as { type: string; features: Array<{ properties: { name: string } }> };
        expect(map.type).toBe("FeatureCollection");
        expect(map.features).toHaveLength(27);
        expect(new Set(map.features.map((item) => item.properties.name))).toEqual(new Set(MOCK_DASHBOARD.stateWaste.map((item) => item.id)));
    });
});

describe("validação antes da renderização", () => {
    it.each([NaN, Infinity, -1, "18.4", null, 101])("rejeita taxa inválida: %s", (rate) => {
        expect(() => validation.toValidatedDashboard({ ...MOCK_DASHBOARD, summary: { ...MOCK_DASHBOARD.summary, wasteRate: rate } })).toThrow();
    });

    it("sanitiza os rótulos externos e neutraliza marcação de HTML e rich text", () => {
        const data = validation.toValidatedDashboard({ ...MOCK_DASHBOARD, belowMinimum: [{ id: "item", name: ' <img src=x onerror="window.attack=true">Banana {style|texto}\u0001 ', missingVolume: 3 }] });
        expect(data.belowMinimum[0].name).toBe("Banana style|texto");
    });

    it("rejeita nomes além do tamanho máximo e identificadores duplicados", () => {
        expect(() => validation.toValidatedDashboard({ ...MOCK_DASHBOARD, belowMinimum: [{ id: "item", name: "a".repeat(101), missingVolume: 1 }] })).toThrow();
        expect(() => validation.toValidatedDashboard({ ...MOCK_DASHBOARD, monthlyWaste: [MOCK_DASHBOARD.monthlyWaste[0], MOCK_DASHBOARD.monthlyWaste[0]] })).toThrow("duplicados");
    });

    it("rejeita quartis fora de ordem", () => {
        expect(() => validation.toValidatedDashboard({ ...MOCK_DASHBOARD, categoryShelfLife: [{ ...MOCK_DASHBOARD.categoryShelfLife[0], median: 99 }] })).toThrow("Quartis");
    });

    it("rejeita UF inexistente em vez de omiti-la silenciosamente do mapa", () => {
        expect(() => validation.toValidatedDashboard({ ...MOCK_DASHBOARD, stateWaste: [{ id: "ZZ", name: "Inválido", level: "highest" }] })).toThrow("UF desconhecida");
    });

    it("rejeita referências a categorias desconhecidas e células duplicadas", () => {
        expect(() => validation.toValidatedDashboard({ ...MOCK_DASHBOARD, regionalConsumption: [{ ...MOCK_DASHBOARD.regionalConsumption[0], categoryId: "desconhecida" }] })).toThrow("desconhecida");
        expect(() => validation.toValidatedDashboard({ ...MOCK_DASHBOARD, regionalConsumption: [MOCK_DASHBOARD.regionalConsumption[0], { ...MOCK_DASHBOARD.regionalConsumption[0], id: "outro-id" }] })).toThrow("duplicadas");
    });
});

describe("gráficos derivados dos dados", () => {
    it("atualiza a linha, a meta, a escala e a tabela a partir do contrato", () => {
        const charts = buildDashboardCharts({ ...MOCK_DASHBOARD, monthlyTarget: 24, monthlyWaste: [{ id: "jan", month: "Jan", rate: 40 }] });
        const monthly = charts.find((item) => item.id === "monthly-waste");
        const line = (monthly?.option.series as LineSeriesOption[])[0];
        expect(monthly?.title).toContain("24%");
        expect(line.data).toEqual([40]);
        expect(line.markLine?.data).toEqual([{ yAxis: 24 }]);
        expect(monthly?.table.rows[0].cells).toEqual(["Jan", "40%", "24%"]);
        expect(monthly?.option.yAxis).toMatchObject({ max: 40 });
    });

    it("ordena e limita o top 10 sem alterar a lista de origem", () => {
        const items = Array.from({ length: 12 }, (_, index) => ({ id: `item-${index}`, name: `Item ${index}`, missingVolume: index }));
        const before = structuredClone(items);
        const model = buildDashboardCharts({ ...MOCK_DASHBOARD, belowMinimum: items }).find((item) => item.id === "below-minimum");
        expect(model?.table.rows).toHaveLength(10);
        expect(model?.table.rows[0].cells).toEqual(["Item 11", "11"]);
        expect(items).toEqual(before);
    });

    it("suporta novas categorias e distingue ausência de valor de zero", () => {
        const data = validation.toValidatedDashboard({ ...MOCK_DASHBOARD, categories: [...MOCK_DASHBOARD.categories, { id: "padaria", name: "Padaria" }], regionalWaste: [...MOCK_DASHBOARD.regionalWaste, { id: "padaria-norte", regionId: "norte", categoryId: "padaria", volume: 0 }] });
        const model = buildDashboardCharts(data).find((item) => item.id === "regional-waste");
        const series = (model?.option.series as BarSeriesOption[]).find((item) => item.name === "Padaria");
        expect(series?.data).toEqual([0, null, null, null, null]);
        expect(model?.table.rows[0].cells.at(-1)).toBe("0");
        expect(model?.table.rows[1].cells.at(-1)).toBe("Sem dados");
    });

    it("mantém os sete estados vazios sem inventar observações", () => {
        const charts = buildDashboardCharts({ ...MOCK_DASHBOARD, monthlyWaste: [], stateWaste: [], regionalWaste: [], regionalConsumption: [], shelfLifeDistribution: [], categoryShelfLife: [], belowMinimum: [] });
        expect(charts).toHaveLength(7);
        expect(charts.every((item) => item.empty)).toBe(true);
    });

    it("garante contraste AA em toda a escala contínua do heatmap", () => {
        const luminance = (hex: string): number => {
            const rgb = [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
            return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
        };
        for (let value = 0; value <= 1000; value++) {
            const colors = consumptionColors(value, 1000);
            const fill = luminance(colors.fill);
            const foreground = luminance(colors.text);
            expect((Math.max(fill, foreground) + 0.05) / (Math.min(fill, foreground) + 0.05)).toBeGreaterThanOrEqual(4.5);
        }
    });
});
