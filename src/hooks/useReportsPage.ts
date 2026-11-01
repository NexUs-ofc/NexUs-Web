import { useMemo } from "react";
import type { ReportMonthGroup, ReportPdfState } from "../types/report";
import { countReports, filterReportGroups, getReportYears } from "../utils/reportFilters";
import type { UseReportFiltersResult } from "./useReportFilters";
import { useReportFilters } from "./useReportFilters";
import { useReportPdf } from "./useReportPdf";
import type { UseReportPdfResult } from "./useReportPdf";
import { useReports } from "./useReports";

export interface UseReportsPageResult {
    filtersState: UseReportFiltersResult;
    pdf: UseReportPdfResult;
    pdfState: ReportPdfState;
    groups: ReadonlyArray<ReportMonthGroup>;
    years: ReadonlyArray<number>;
    total: number;
    hasAnyReport: boolean;
    loading: boolean;
    error: string;
    reload: () => void;
}

// Junta busca/filtros, carregamento e PDF para a página só renderizar.
export function useReportsPage(): UseReportsPageResult {
    const filtersState = useReportFilters();
    const { filters } = filtersState;
    const { data, loading, error, reload } = useReports();
    const pdf = useReportPdf();

    const years = useMemo(() => getReportYears(data), [data]);
    const groups = useMemo(() => filterReportGroups(data, filters), [data, filters]);
    const total = useMemo(() => countReports(groups), [groups]);
    const hasAnyReport = data !== null && data.groups.length > 0;

    return { filtersState, pdf, pdfState: pdf.state, groups, years, total, hasAnyReport, loading, error, reload };
}
