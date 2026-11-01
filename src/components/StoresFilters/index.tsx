import { memo, useId } from "react";
import type GenericComponentProps from "../../types/common";
import type { StoreFilters, StoreLocation } from "../../types/store";
import { STORE_SEARCH_MAX_LENGTH } from "../../utils/storeFilters";
import "../../../styles/components/StoresFilters/stores-filters.css";

export interface StoresFiltersProps extends GenericComponentProps {
    filters: StoreFilters;
    loading: boolean;
    cities: ReadonlyArray<StoreLocation>;
    states: ReadonlyArray<StoreLocation>;
    onSearchChange: (search: string) => void;
    onCityChange: (city: string) => void;
    onStateChange: (state: string) => void;
}

function StoresFilters({ filters, loading, cities, states, onSearchChange, onCityChange, onStateChange, className = "", id }: StoresFiltersProps) {
    const fieldId = useId();

    return (
        <section className={`stores-filters ${className}`} id={id} aria-label="Filtros de filiais">
            <div className="stores-filters__search">
                <img src={`${import.meta.env.BASE_URL}stores/search.svg`} alt="" />
                <label className="stores-filters__label" htmlFor={`${fieldId}-search`}>Buscar filial por nome ou cidade</label>
                <input
                    id={`${fieldId}-search`}
                    type="search"
                    name="search"
                    placeholder="Buscar filial por nome ou cidade..."
                    maxLength={STORE_SEARCH_MAX_LENGTH}
                    value={filters.search}
                    onChange={(event) => onSearchChange(event.currentTarget.value)}
                    aria-controls={loading ? undefined : "stores-table"}
                />
            </div>
            {([
                { field: "state", label: "Estado", options: states, onChange: onStateChange },
                { field: "city", label: "Cidade", options: cities, onChange: onCityChange },
            ] as const).map(({ field, label, options, onChange }) => (
                <div className="stores-filters__select" key={field}>
                    <label className="stores-filters__label" htmlFor={`${fieldId}-${field}`}>{label} da filial</label>
                    <select id={`${fieldId}-${field}`} name={field} value={filters[field]}
                        onChange={(event) => onChange(event.currentTarget.value)} aria-controls={loading ? undefined : "stores-table"}>
                        <option value="">{label === "Estado" ? "Todos os estados" : "Todas as cidades"}</option>
                        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    <img src={`${import.meta.env.BASE_URL}stores/chevron-down.svg`} alt="" />
                </div>
            ))}
        </section>
    );
}

// Callbacks estáveis do hook permitem pular renderizações quando os filtros não mudam.
export default memo(StoresFilters);
