import type { ReportFilters, ReportMonthGroup, ReportPeriodOption, ReportsList } from "../types/report";

export const REPORT_SEARCH_MAX_LENGTH = 100;

export const REPORT_MONTH_OPTIONS: ReadonlyArray<ReportPeriodOption> = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
].map((label, index) => ({ value: index + 1, label }));

export const INITIAL_REPORT_FILTERS: ReportFilters = { search: "", year: "", month: "" };

export function sanitizeReportSearch(value: string): string {
    return value.replace(/\p{Cc}/gu, "").slice(0, REPORT_SEARCH_MAX_LENGTH);
}

/** Ano do filtro: só 4 dígitos (ex.: "2026"); qualquer outra coisa volta para "todos os anos". */
export function sanitizeReportYear(value: string): string {
    return /^\d{4}$/u.test(value) ? value : "";
}

/** Mês do filtro: "1" a "12"; qualquer outra coisa volta para "todos os meses". */
export function sanitizeReportMonth(value: string): string {
    const month = Number(value);
    return /^\d{1,2}$/u.test(value) && month >= 1 && month <= 12 ? String(month) : "";
}

function normalize(value: string): string {
    return value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("pt-BR").trim();
}

/** Anos que têm relatório, do mais antigo para o mais novo (alimenta o filtro de ano). */
export function getReportYears(list: ReportsList | null): number[] {
    if (list === null) return [];
    return Array.from(new Set(list.groups.map((group) => group.year))).sort((first, second) => first - second);
}

// A API devolve todos os meses; ano, mês e nome são aplicados aqui, sem nova requisição.
export function filterReportGroups(list: ReportsList | null, filters: ReportFilters): ReportMonthGroup[] {
    if (list === null) return [];
    const search = normalize(sanitizeReportSearch(filters.search));
    // Sempre do mais antigo para o mais novo, qualquer que seja a ordem em que a API devolva.
    return [...list.groups]
        .sort((first, second) => first.year - second.year || first.month - second.month)
        .filter((group) => (filters.year === "" || String(group.year) === filters.year)
            && (filters.month === "" || String(group.month) === filters.month))
        .map((group) => ({
            ...group,
            reports: group.reports
                .filter((report) => search === "" || normalize(`${report.title} ${group.title}`).includes(search))
                .sort((first, second) => first.date.localeCompare(second.date)),
        }))
        .filter((group) => group.reports.length > 0);
}

export function countReports(groups: ReadonlyArray<ReportMonthGroup>): number {
    return groups.reduce((total, group) => total + group.reports.length, 0);
}

export function formatReportCount(total: number): string {
    return `${total} ${total === 1 ? "relatório" : "relatórios"}`;
}

/** "2026-09-30" -> "30/09/2026", sem passar por Date (evita deslocar o dia pelo fuso). */
export function formatReportDate(isoDate: string): string {
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year}`;
}
