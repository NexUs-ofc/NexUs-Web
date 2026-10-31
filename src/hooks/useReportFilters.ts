import { useCallback, useState } from "react";
import type { ReportFilters } from "../types/report";
import { INITIAL_REPORT_FILTERS, sanitizeReportSearch } from "../utils/reportFilters";

export interface UseReportFiltersResult {
    filters: ReportFilters;
    setSearch: (search: string) => void;
    setYear: (year: string) => void;
    setMonth: (month: string) => void;
}

export function useReportFilters(): UseReportFiltersResult {
    const [filters, setFilters] = useState<ReportFilters>(INITIAL_REPORT_FILTERS);

    const setSearch = useCallback((search: string): void => {
        setFilters((previous) => ({ ...previous, search: sanitizeReportSearch(search) }));
    }, []);
    const setYear = useCallback((year: string): void => {
        setFilters((previous) => ({ ...previous, year }));
    }, []);
    const setMonth = useCallback((month: string): void => {
        setFilters((previous) => ({ ...previous, month }));
    }, []);

    return { filters, setSearch, setYear, setMonth };
}
