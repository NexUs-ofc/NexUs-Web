import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import type { Store, StoreFormData } from "../types/store";
import { createStore, deleteStore, deleteStoreImage, getStores, updateStore, updateStoreImage } from "../services/stores.service";

interface StoreMutationResult { store?: Store; removedId?: string; warning?: string; }

export interface StoreCollectionState {
    stores: ReadonlyArray<Store>;
    loading: boolean;
    saving: boolean;
    error: string;
    success: string;
    warning: string;
}

type StoreCollectionAction =
    | { type: "load" }
    | { type: "loaded"; stores: ReadonlyArray<Store> }
    | { type: "start" }
    | { type: "saved"; result: StoreMutationResult; message: string }
    | { type: "error"; message: string }
    | { type: "clear" }
    | { type: "clear-error" };

const initialState: StoreCollectionState = { stores: [], loading: true, saving: false, error: "", success: "", warning: "" };

function reducer(state: StoreCollectionState, action: StoreCollectionAction): StoreCollectionState {
    switch (action.type) {
        case "load": return { ...state, loading: true, error: "" };
        case "loaded": return { ...state, stores: action.stores, loading: false, error: "" };
        case "start": return { ...state, loading: false, saving: true, error: "", success: "", warning: "" };
        case "saved": {
            const { store, removedId, warning = "" } = action.result;
            const stores = removedId !== undefined ? state.stores.filter((item) => item.id !== removedId)
                : store ? state.stores.some((item) => item.id === store.id)
                    ? state.stores.map((item) => item.id === store.id ? { ...item, ...store } : item)
                    : [...state.stores, store] : state.stores;
            return { ...state, stores, saving: false, error: "", success: action.message, warning };
        }
        case "error": return { ...state, loading: false, saving: false, error: action.message, success: "" };
        case "clear": return { ...state, error: "", success: "", warning: "" };
        case "clear-error": return { ...state, error: "" };
    }
}

export interface UseStoreCollectionResult extends StoreCollectionState {
    addStore: (data: StoreFormData) => Promise<boolean>;
    editStore: (id: string, data: StoreFormData) => Promise<boolean>;
    removeStore: (id: string) => Promise<boolean>;
    reload: () => void;
    clearFeedback: () => void;
    clearError: () => void;
}

export function useStoreCollection(): UseStoreCollectionResult {
    const [state, dispatch] = useReducer(reducer, initialState);
    const loadController = useRef<AbortController | null>(null);
    const mutationController = useRef<AbortController | null>(null);
    const mounted = useRef(false);

    const reload = useCallback((): void => {
        if (mutationController.current !== null) return;
        loadController.current?.abort();
        const controller = new AbortController();
        loadController.current = controller;
        dispatch({ type: "load" });
        void getStores({ signal: controller.signal }).then((stores) => {
            if (mounted.current && !controller.signal.aborted) dispatch({ type: "loaded", stores });
        }).catch((error: unknown) => {
            if (mounted.current && !controller.signal.aborted) dispatch({ type: "error", message: error instanceof Error ? error.message : "Erro ao carregar filiais." });
        });
    }, []);

    useEffect(() => {
        mounted.current = true;
        reload();
        return () => {
            mounted.current = false;
            loadController.current?.abort();
            mutationController.current?.abort();
        };
    }, [reload]);

    const mutate = useCallback(async (operation: (signal: AbortSignal) => Promise<StoreMutationResult>, message: string): Promise<boolean> => {
        if (mutationController.current !== null || !mounted.current) return false;
        const controller = new AbortController();
        mutationController.current = controller;
        loadController.current?.abort();
        dispatch({ type: "start" });
        try {
            const result = await operation(controller.signal);
            if (!mounted.current || controller.signal.aborted) return false;
            dispatch({ type: "saved", result, message });
            return true;
        } catch (error) {
            if (mounted.current && !controller.signal.aborted) dispatch({ type: "error", message: error instanceof Error ? error.message : "Não foi possível concluir a operação." });
            return false;
        } finally {
            if (mutationController.current === controller) mutationController.current = null;
        }
    }, []);

    const addStore = useCallback((data: StoreFormData): Promise<boolean> => mutate(async (signal) => {
        const store = await createStore(data, { signal });
        return savePhoto(store, data.photoDataUrl, signal);
    }, "Filial cadastrada com sucesso."), [mutate]);
    const editStore = useCallback((id: string, data: StoreFormData): Promise<boolean> => mutate(async (signal) => {
        const store = await updateStore(id, data, { signal });
        return savePhoto(store, data.photoDataUrl, signal);
    }, "Loja atualizada com sucesso."), [mutate]);
    const removeStore = useCallback((id: string): Promise<boolean> => mutate(async (signal) => {
        await deleteStore(id, { signal });
        return { removedId: id };
    }, "Loja excluída com sucesso."), [mutate]);
    const clearFeedback = useCallback((): void => dispatch({ type: "clear" }), []);
    const clearError = useCallback((): void => dispatch({ type: "clear-error" }), []);

    // As páginas consomem a mesma coleção sem repassar dados e operações pelo layout.
    return useMemo(() => ({ ...state, addStore, editStore, removeStore, reload, clearFeedback, clearError }), [state, addStore, editStore, removeStore, reload, clearFeedback, clearError]);
}

async function savePhoto(store: Store, photo: string, signal: AbortSignal): Promise<StoreMutationResult> {
    try {
        const image = photo.startsWith("data:") ? await updateStoreImage(store.id, photo, { signal })
            : !photo && store.storeImageUrl ? await deleteStoreImage(store.id, { signal }) : null;
        return { store: image ? { ...store, storeImageUrl: image.profileImageUrl } : store };
    } catch (error) {
        if (signal.aborted) throw error;
        return { store, warning: `Os dados da filial foram salvos, mas a foto não foi atualizada. Edite a filial para tentar novamente. ${error instanceof Error ? error.message : ""}` };
    }
}
