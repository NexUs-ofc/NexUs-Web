import type { CreateStorePayload, Store, StoreFormData, StoreImageResponse, StorePayload } from "../types/store";
import { parseStore, parseStoreImageResponse, parseStores, validateStoreId } from "../utils/parseStore";
import { validateStorePhoto, storePhotoFile } from "../utils/storePhoto";
import { toStorePayload, toValidatedStoreData } from "../utils/validateStore";
import { coreRequest } from "./coreClient";

export interface StoresRequestOptions { signal?: AbortSignal; }
const STORES_ENDPOINT = "/api/companies/me/stores";

function storeEndpoint(id: string): string {
    return `${STORES_ENDPOINT}/${validateStoreId(id)}`;
}

function storeWithContact(store: Store, payload: StorePayload): Store {
    return { ...store,
        ...(payload.address.cep ? { cep: payload.address.cep } : {}),
        ...(payload.phones ? { phones: payload.phones } : {}),
    };
}

export async function getStores(options: StoresRequestOptions = {}): Promise<Store[]> {
    try {
        return parseStores(await coreRequest<unknown>(STORES_ENDPOINT, options));
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error("Não foi possível carregar as filiais.", { cause: error });
    }
}

export async function getStore(id: string, options: StoresRequestOptions = {}): Promise<Store> {
    try {
        const store = parseStore(await coreRequest<unknown>(storeEndpoint(id), options));
        if (store.id !== id) throw new Error("O core retornou uma filial diferente da solicitada.");
        return store;
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error("Não foi possível carregar a filial.", { cause: error });
    }
}

export async function createStore(data: StoreFormData, options: StoresRequestOptions = {}): Promise<Store> {
    try {
        const validated = toValidatedStoreData(data, "create");
        const body: CreateStorePayload = { ...toStorePayload(validated), email: validated.email };
        return storeWithContact(parseStore(await coreRequest<unknown>(STORES_ENDPOINT, { ...options, method: "POST", body })), body);
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error("Não foi possível cadastrar a filial.", { cause: error });
    }
}

export async function updateStore(id: string, data: StoreFormData, options: StoresRequestOptions = {}): Promise<Store> {
    try {
        const endpoint = storeEndpoint(id);
        const body = toStorePayload(toValidatedStoreData(data, "edit"));
        const store = parseStore(await coreRequest<unknown>(endpoint, { ...options, method: "PATCH", body }));
        if (store.id !== id) throw new Error("O core retornou uma filial diferente da editada. Atualize a lista antes de continuar.");
        return storeWithContact(store, body);
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error("Não foi possível salvar a filial.", { cause: error });
    }
}

export async function deleteStore(id: string, options: StoresRequestOptions = {}): Promise<void> {
    try {
        await coreRequest<null>(storeEndpoint(id), { ...options, method: "DELETE" });
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error("Não foi possível excluir a filial.", { cause: error });
    }
}

export async function updateStoreImage(id: string, photoDataUrl: string, options: StoresRequestOptions = {}): Promise<StoreImageResponse> {
    try {
        const endpoint = `${storeEndpoint(id)}/image`;
        const file = storePhotoFile(photoDataUrl);
        await validateStorePhoto(file, options.signal ?? new AbortController().signal);
        const body = new FormData();
        body.append("file", file);
        return parseStoreImageResponse(await coreRequest<unknown>(endpoint, { ...options, method: "PUT", body }));
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error("Não foi possível enviar a foto da filial.", { cause: error });
    }
}

export async function deleteStoreImage(id: string, options: StoresRequestOptions = {}): Promise<StoreImageResponse> {
    try {
        return parseStoreImageResponse(await coreRequest<unknown>(`${storeEndpoint(id)}/image`, { ...options, method: "DELETE" }));
    } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error("Não foi possível remover a foto da filial.", { cause: error });
    }
}
