import { memo, useId } from "react";
import { MdKeyboardArrowDown, MdSearch } from "react-icons/md";
import type GenericComponentProps from "../../types/common";
import type { ReportFilters, ReportPeriodOption } from "../../types/report";
import { REPORT_SEARCH_MAX_LENGTH } from "../../utils/reportFilters";
import "../../../styles/components/ReportsFilters/reports-filters.css";

export interface ReportsFiltersProps extends GenericComponentProps {
    filters: ReportFilters;
    years: ReadonlyArray<number>;
    months: ReadonlyArray<ReportPeriodOption>;
    onSearchChange: (search: string) => void;
    onYearChange: (year: string) => void;
    onMonthChange: (month: string) => void;
}

function ReportsFilters({ filters, years, months, onSearchChange, onYearChange, onMonthChange, className = "", id }: ReportsFiltersProps) {
    const fieldId = useId();

    return (
        <section className={`reports-filters ${className}`} id={id} aria-label="Filtros de relatórios">
            <div className="reports-filters__search">
                <MdSearch className="reports-filters__icon reports-filters__icon--start" aria-hidden="true" />
                <label className="reports-filters__label" htmlFor={`${fieldId}-search`}>Buscar relatório por nome</label>
                <input
                    id={`${fieldId}-search`}
                    type="search"
                    name="search"
                    placeholder="Buscar relatório por nome..."
                    maxLength={REPORT_SEARCH_MAX_LENGTH}
                    autoComplete="off"
                    value={filters.search}
                    onChange={(event) => onSearchChange(event.currentTarget.value)}
                />
            </div>
            <div className="reports-filters__select">
                <label className="reports-filters__label" htmlFor={`${fieldId}-year`}>Ano</label>
                <select id={`${fieldId}-year`} name="year" value={filters.year} onChange={(event) => onYearChange(event.currentTarget.value)}>
                    <option value="">Todos os anos</option>
                    {years.map((year) => <option key={year} value={String(year)}>{year}</option>)}
                </select>
                <MdKeyboardArrowDown className="reports-filters__icon reports-filters__icon--end" aria-hidden="true" />
            </div>
            <div className="reports-filters__select">
                <label className="reports-filters__label" htmlFor={`${fieldId}-month`}>Mês</label>
                <select id={`${fieldId}-month`} name="month" value={filters.month} onChange={(event) => onMonthChange(event.currentTarget.value)}>
                    <option value="">Todos os meses</option>
                    {months.map((month) => <option key={month.value} value={String(month.value)}>{month.label}</option>)}
                </select>
                <MdKeyboardArrowDown className="reports-filters__icon reports-filters__icon--end" aria-hidden="true" />
            </div>
        </section>
    );
}

// Callbacks estáveis dos hooks permitem pular renderizações quando os filtros não mudam.
export default memo(ReportsFilters);
