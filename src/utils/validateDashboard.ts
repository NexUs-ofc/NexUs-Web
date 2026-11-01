import type { DashboardData, WasteLevel } from "../types/dashboard";
import { asList as list, asNumber as number, asRecord as record, asText as text } from "./responseParsers";
import { BRAZILIAN_STATES } from "./validateStore";

function wasteLevel(value: unknown): WasteLevel {
    if (value === "highest" || value === "intermediate" || value === "average" || value === "lowest") return value;
    throw new Error("Classificação por UF inválida.");
}

function stateId(value: unknown): string {
    const id = text(value, 2);
    if (!BRAZILIAN_STATES.includes(id)) throw new Error("UF desconhecida no dashboard.");
    return id;
}

export function toValidatedDashboard(value: unknown): DashboardData {
    const data = record(value);
    const summary = record(data.summary);
    const result: DashboardData = {
        summary: {
            wasteRate: number(summary.wasteRate, 100), expiredKg: number(summary.expiredKg),
            expiringInSevenDaysKg: number(summary.expiringInSevenDaysKg), withoutExpiryKg: number(summary.withoutExpiryKg),
        },
        monthlyTarget: number(data.monthlyTarget, 100),
        monthlyWaste: list(data.monthlyWaste, (item) => ({ id: text(item.id), month: text(item.month), rate: number(item.rate, 100) })),
        stateWaste: list(data.stateWaste, (item) => ({ id: stateId(item.id), name: text(item.name), level: wasteLevel(item.level) })),
        regions: list(data.regions, (item) => ({ id: text(item.id), name: text(item.name), abbreviation: text(item.abbreviation, 8) })),
        categories: list(data.categories, (item) => ({ id: text(item.id), name: text(item.name) })),
        regionalWaste: list(data.regionalWaste, (item) => ({
            id: text(item.id), regionId: text(item.regionId), categoryId: text(item.categoryId), volume: number(item.volume),
        })),
        regionalConsumption: list(data.regionalConsumption, (item) => ({
            id: text(item.id), regionId: text(item.regionId), categoryId: text(item.categoryId), kilograms: number(item.kilograms),
        })),
        shelfLifeDistribution: list(data.shelfLifeDistribution, (item) => ({ id: text(item.id), label: text(item.label), count: number(item.count) })),
        categoryShelfLife: list(data.categoryShelfLife, (item) => {
            const bounds = [item.minimum, item.firstQuartile, item.median, item.thirdQuartile, item.maximum].map((entry) => number(entry));
            if (bounds.some((entry, index) => index > 0 && entry < bounds[index - 1])) throw new Error("Quartis de vida útil fora de ordem.");
            return { id: text(item.id), categoryId: text(item.categoryId), minimum: bounds[0], firstQuartile: bounds[1], median: bounds[2], thirdQuartile: bounds[3], maximum: bounds[4] };
        }),
        belowMinimum: list(data.belowMinimum, (item) => ({ id: text(item.id), name: text(item.name), missingVolume: number(item.missingVolume) })),
    };
    const categoryIds = new Set(result.categories.map((item) => item.id));
    const regionIds = new Set(result.regions.map((item) => item.id));
    for (const item of [...result.regionalWaste, ...result.regionalConsumption]) {
        if (!categoryIds.has(item.categoryId) || !regionIds.has(item.regionId)) throw new Error("Categoria ou região desconhecida no dashboard.");
    }
    if (result.categoryShelfLife.some((item) => !categoryIds.has(item.categoryId))) throw new Error("Categoria desconhecida na vida útil.");
    for (const entries of [result.regionalWaste, result.regionalConsumption]) {
        const pairs = entries.map((item) => JSON.stringify([item.categoryId, item.regionId]));
        if (new Set(pairs).size !== pairs.length) throw new Error("Categoria e região duplicadas no dashboard.");
    }
    return result;
}
