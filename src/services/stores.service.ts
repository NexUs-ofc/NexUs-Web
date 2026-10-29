import { MOCK_STORES } from "../mocks/stores";
import type { Store, StoreFormData } from "../types/store";
import { loadStores, saveStores } from "../utils/storeStorage";
import { toValidatedStoreData } from "../utils/validateStore";

export interface StoresRequestOptions { signal?: AbortSignal; }

// Repositório local demonstrativo. Nenhuma destas operações acessa o back-end.
export async function getStores(profileId: number, options: StoresRequestOptions = {}): Promise<Store[]> {
    try {
        await Promise.resolve();
        options.signal?.throwIfAborted();
        return loadStores(profileId) ?? MOCK_STORES.map((store) => ({ ...store }));
    } catch (error) {
        if (options.signal?.aborted) throw error;
        throw new Error("Não foi possível carregar as filiais salvas neste navegador.", { cause: error });
    }
}

export async function createStore(profileId: number, data: StoreFormData, options: StoresRequestOptions = {}): Promise<Store[]> {
    try {
        const validated = toValidatedStoreData(data, "create");
        const stores = await getStores(profileId, options);
        options.signal?.throwIfAborted();
        const next = [...stores, { id: crypto.randomUUID(), ...validated }];
        saveStores(profileId, next);
        return next;
    } catch (error) {
        if (options.signal?.aborted) throw error;
        throw new Error("Não foi possível cadastrar a filial. Verifique os dados e o armazenamento do navegador.", { cause: error });
    }
}

export async function updateStore(profileId: number, id: string, data: StoreFormData, options: StoresRequestOptions = {}): Promise<Store[]> {
    try {
        const validated = toValidatedStoreData(data, "edit");
        const stores = await getStores(profileId, options);
        if (!stores.some((store) => store.id === id)) throw new Error("Filial não encontrada.");
        options.signal?.throwIfAborted();
        // A edição não altera os campos exclusivos do cadastro.
        const { name, cep, phone, address, city, state, manager, photoDataUrl } = validated;
        const next = stores.map((store) => store.id === id ? { ...store, name, cep, phone, address, city, state, manager, photoDataUrl } : store);
        saveStores(profileId, next);
        return next;
    } catch (error) {
        if (options.signal?.aborted) throw error;
        throw new Error("Não foi possível salvar a loja. Verifique os dados e tente novamente.", { cause: error });
    }
}

export async function deleteStore(profileId: number, id: string, options: StoresRequestOptions = {}): Promise<Store[]> {
    try {
        const stores = await getStores(profileId, options);
        if (!stores.some((store) => store.id === id)) throw new Error("Filial não encontrada.");
        options.signal?.throwIfAborted();
        const next = stores.filter((store) => store.id !== id);
        saveStores(profileId, next);
        return next;
    } catch (error) {
        if (options.signal?.aborted) throw error;
        throw new Error("Não foi possível excluir a loja. Tente novamente.", { cause: error });
    }
}
