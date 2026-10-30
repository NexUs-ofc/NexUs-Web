const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export function formatDashboardNumber(value: number): string { return decimal.format(value); }
export function formatDashboardPercent(value: number): string { return `${decimal.format(value)}%`; }
export function formatDashboardKg(value: number): string { return `${decimal.format(value)} kg`; }
