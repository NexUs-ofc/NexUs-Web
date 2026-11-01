import type { Store, StoreFilters, StoreLocation } from "../types/store";

export const STORE_SEARCH_MAX_LENGTH = 120;

export function sanitizeStoreSearch(value: string): string {
    return value.replace(/\p{Cc}/gu, "").slice(0, STORE_SEARCH_MAX_LENGTH);
}

function normalizeSearch(value: string): string {
    return value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("pt-BR").trim();
}

export function getStoreFilterOptions(stores: ReadonlyArray<Store>, field: "city" | "state"): StoreLocation[] {
    return [...new Set(stores.map((store) => store[field]).filter(Boolean))]
        .sort((first, second) => first.localeCompare(second, "pt-BR"))
        .map((value) => ({ value, label: value }));
}

export function filterStores(stores: ReadonlyArray<Store>, filters: StoreFilters): Store[] {
    const search = normalizeSearch(sanitizeStoreSearch(filters.search));

    return stores.filter((store) => {
        const matchesSearch = normalizeSearch(store.name).includes(search) || normalizeSearch(store.city).includes(search);
        const matchesCity = filters.city === "" || store.city === filters.city;
        const matchesState = filters.state === "" || store.state === filters.state;
        return matchesSearch && matchesCity && matchesState;
    });
}
