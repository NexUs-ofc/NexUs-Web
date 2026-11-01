import { useCallback, useMemo, useState } from "react";
import { useStoresContext } from "./useStoresContext";
import type { Store, StoreFilters, StoreLocation } from "../types/store";
import { filterStores, getStoreFilterOptions, sanitizeStoreSearch } from "../utils/storeFilters";

export interface UseStoresResult {
    stores: ReadonlyArray<Store>;
    filters: StoreFilters;
    cities: ReadonlyArray<StoreLocation>;
    states: ReadonlyArray<StoreLocation>;
    setSearch: (search: string) => void;
    setCity: (city: string) => void;
    setState: (state: string) => void;
}

export function useStores(): UseStoresResult {
    const { stores: collection } = useStoresContext();
    const [filters, setFilters] = useState<StoreFilters>({ search: "", city: "", state: "" });
    const states = useMemo(() => getStoreFilterOptions(collection, "state"), [collection]);
    const activeState = states.some((option) => option.value === filters.state) ? filters.state : "";
    const cities = useMemo(() => getStoreFilterOptions(collection.filter((store) => !activeState || store.state === activeState), "city"), [collection, activeState]);
    const activeCity = cities.some((option) => option.value === filters.city) ? filters.city : "";
    const activeFilters = useMemo(() => ({ search: filters.search, city: activeCity, state: activeState }), [filters.search, activeCity, activeState]);
    const stores = useMemo(() => filterStores(collection, activeFilters), [collection, activeFilters]);
    const setSearch = useCallback((search: string): void => {
        setFilters((previous) => ({ ...previous, search: sanitizeStoreSearch(search) }));
    }, []);
    const setCity = useCallback((city: string): void => {
        if (!city || cities.some((option) => option.value === city)) setFilters((previous) => ({ ...previous, city }));
    }, [cities]);
    const setState = useCallback((state: string): void => {
        if (state && !states.some((option) => option.value === state)) return;
        setFilters((previous) => ({ ...previous, state, city: collection.some((store) => store.city === previous.city && (!state || store.state === state)) ? previous.city : "" }));
    }, [states, collection]);
    return { stores, filters: activeFilters, cities, states, setSearch, setCity, setState };
}
