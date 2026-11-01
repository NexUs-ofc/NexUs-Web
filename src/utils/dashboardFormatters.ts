const decimal = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

export function formatDashboardNumber(value: number): string { return decimal.format(value); }
export function formatDashboardPercent(value: number): string { return `${decimal.format(value)}%`; }
export function formatDashboardItems(value: number): string { return `${decimal.format(value)} ${value === 1 ? "item" : "itens"}`; }
