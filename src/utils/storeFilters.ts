import type { Store, StoreFilters, StoreLocation } from "../types/store";

export const STORE_SEARCH_MAX_LENGTH = 120;

export function sanitizeStoreSearch(value: string): string {
    return value.replace(/\p{Cc}/gu, "").slice(0, STORE_SEARCH_MAX_LENGTH);
}

function normalizeSearch(value: string): string {
    return value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("pt-BR").trim();
}

export function getStoreLocationValue(store: Store): string {
    return `${store.city}/${store.state}`;
}

export function getStoreLocations(stores: ReadonlyArray<Store>): StoreLocation[] {
    return Array.from(new Map(stores.filter((store) => store.city !== "" || store.state !== "").map((store) => [
        getStoreLocationValue(store),
        { value: getStoreLocationValue(store), label: [store.city, store.state].filter(Boolean).join(" - ") },
    ])).values()).sort((first, second) => first.label.localeCompare(second.label, "pt-BR"));
}

export function filterStores(stores: ReadonlyArray<Store>, filters: StoreFilters): Store[] {
    const search = normalizeSearch(sanitizeStoreSearch(filters.search));

    return stores.filter((store) => {
        const matchesSearch = normalizeSearch(store.name).includes(search) || normalizeSearch(store.city).includes(search);
        const matchesLocation = filters.location === "" || getStoreLocationValue(store) === filters.location;
        return matchesSearch && matchesLocation;
    });
}
