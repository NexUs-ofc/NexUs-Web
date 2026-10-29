import { useCallback, useMemo, useState } from "react";
import { useStoresContext } from "./useStoresContext";
import type { Store, StoreFilters, StoreLocation } from "../types/store";
import { filterStores, getStoreLocations, sanitizeStoreSearch } from "../utils/storeFilters";

export interface UseStoresResult {
    stores: ReadonlyArray<Store>;
    filters: StoreFilters;
    locations: ReadonlyArray<StoreLocation>;
    setSearch: (search: string) => void;
    setLocation: (location: string) => void;
}

export function useStores(): UseStoresResult {
    const { stores: collection } = useStoresContext();
    const [filters, setFilters] = useState<StoreFilters>({ search: "", location: "" });
    // As opções não precisam ser reconstruídas ao digitar na busca.
    const locations = useMemo(() => getStoreLocations(collection), [collection]);
    const activeLocation = locations.some((location) => location.value === filters.location) ? filters.location : "";
    const activeFilters = useMemo(() => ({ ...filters, location: activeLocation }), [filters, activeLocation]);
    // Preserva a referência da lista para a tabela memoizada em renderizações sem mudança de filtro.
    const stores = useMemo(() => filterStores(collection, activeFilters), [collection, activeFilters]);

    const setSearch = useCallback((search: string): void => {
        setFilters((previous) => ({ ...previous, search: sanitizeStoreSearch(search), location: activeLocation }));
    }, [activeLocation]);

    const setLocation = useCallback((location: string): void => {
        if (location === "" || locations.some((option) => option.value === location)) {
            setFilters((previous) => ({ ...previous, location }));
        }
    }, [locations]);

    return { stores, filters: activeFilters, locations, setSearch, setLocation };
}
