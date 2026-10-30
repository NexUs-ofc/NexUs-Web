export type WasteLevel = "highest" | "intermediate" | "average" | "lowest";

export interface DashboardSummary {
    wasteRate: number;
    expiredKg: number;
    expiringInSevenDaysKg: number;
    withoutExpiryKg: number;
}

export interface MonthlyWaste {
    id: string;
    month: string;
    rate: number;
}

export interface StateWaste {
    id: string;
    name: string;
    level: WasteLevel;
}

export interface DashboardCategory {
    id: string;
    name: string;
}

export interface DashboardRegion {
    id: string;
    name: string;
    abbreviation: string;
}

export interface RegionalWaste {
    id: string;
    regionId: string;
    categoryId: string;
    volume: number;
}

export interface RegionalConsumption {
    id: string;
    regionId: string;
    categoryId: string;
    kilograms: number;
}

export interface ShelfLifeBucket {
    id: string;
    label: string;
    count: number;
}

export interface CategoryShelfLife {
    id: string;
    categoryId: string;
    minimum: number;
    firstQuartile: number;
    median: number;
    thirdQuartile: number;
    maximum: number;
}

export interface BelowMinimumItem {
    id: string;
    name: string;
    missingVolume: number;
}

export interface DashboardData {
    summary: DashboardSummary;
    monthlyTarget: number;
    monthlyWaste: ReadonlyArray<MonthlyWaste>;
    stateWaste: ReadonlyArray<StateWaste>;
    regions: ReadonlyArray<DashboardRegion>;
    categories: ReadonlyArray<DashboardCategory>;
    regionalWaste: ReadonlyArray<RegionalWaste>;
    regionalConsumption: ReadonlyArray<RegionalConsumption>;
    shelfLifeDistribution: ReadonlyArray<ShelfLifeBucket>;
    categoryShelfLife: ReadonlyArray<CategoryShelfLife>;
    belowMinimum: ReadonlyArray<BelowMinimumItem>;
}
