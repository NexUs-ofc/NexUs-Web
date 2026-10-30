import { memo, useId } from "react";
import type GenericComponentProps from "../../types/common";
import type { StoreFilters, StoreLocation } from "../../types/store";
import { STORE_SEARCH_MAX_LENGTH } from "../../utils/storeFilters";
import "../../../styles/components/StoresFilters/stores-filters.css";

export interface StoresFiltersProps extends GenericComponentProps {
    filters: StoreFilters;
    locations: ReadonlyArray<StoreLocation>;
    onSearchChange: (search: string) => void;
    onLocationChange: (location: string) => void;
}

function StoresFilters({ filters, locations, onSearchChange, onLocationChange, className = "", id }: StoresFiltersProps) {
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
                    aria-controls="stores-table"
                />
            </div>
            <div className="stores-filters__select stores-filters__status">
                <label className="stores-filters__label" htmlFor={`${fieldId}-status`}>Status da filial</label>
                <select id={`${fieldId}-status`} disabled aria-describedby={`${fieldId}-status-help`}>
                    <option>Status: Todas</option>
                </select>
                <img src={`${import.meta.env.BASE_URL}stores/chevron-down.svg`} alt="" />
                <span className="stores-filters__label" id={`${fieldId}-status-help`}>Filtro de status indisponível nesta versão.</span>
            </div>
            <div className="stores-filters__select">
                <label className="stores-filters__label" htmlFor={`${fieldId}-location`}>Localização da filial</label>
                <select
                    id={`${fieldId}-location`}
                    name="location"
                    value={filters.location}
                    onChange={(event) => onLocationChange(event.currentTarget.value)}
                    aria-controls="stores-table"
                >
                    <option value="">Localização</option>
                    {locations.map((location) => <option key={location.value} value={location.value}>{location.label}</option>)}
                </select>
                <img src={`${import.meta.env.BASE_URL}stores/chevron-down.svg`} alt="" />
            </div>
        </section>
    );
}

// Callbacks estáveis do hook permitem pular renderizações quando os filtros não mudam.
export default memo(StoresFilters);
