import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import type { Store, StoreFormData } from "../types/store";
import { createStore, deleteStore, getStores, updateStore } from "../services/stores.service";

export interface StoreCollectionState {
    stores: ReadonlyArray<Store>;
    loading: boolean;
    saving: boolean;
    error: string;
    success: string;
}

type StoreCollectionAction =
    | { type: "load" }
    | { type: "loaded"; stores: ReadonlyArray<Store> }
    | { type: "start" }
    | { type: "saved"; stores: ReadonlyArray<Store>; message: string }
    | { type: "error"; message: string }
    | { type: "clear" }
    | { type: "clear-error" };

const initialState: StoreCollectionState = { stores: [], loading: true, saving: false, error: "", success: "" };

function reducer(state: StoreCollectionState, action: StoreCollectionAction): StoreCollectionState {
    switch (action.type) {
        case "load": return { ...state, loading: true, error: "" };
        case "loaded": return { ...state, stores: action.stores, loading: false, error: "" };
        case "start": return { ...state, saving: true, error: "", success: "" };
        case "saved": return { ...state, stores: action.stores, saving: false, error: "", success: action.message };
        case "error": return { ...state, loading: false, saving: false, error: action.message, success: "" };
        case "clear": return { ...state, error: "", success: "" };
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

export function useStoreCollection(profileId: number): UseStoreCollectionResult {
    const [state, dispatch] = useReducer(reducer, initialState);
    const loadController = useRef<AbortController | null>(null);
    const mutationController = useRef<AbortController | null>(null);
    const mounted = useRef(false);

    const reload = useCallback((): void => {
        loadController.current?.abort();
        const controller = new AbortController();
        loadController.current = controller;
        dispatch({ type: "load" });
        void getStores(profileId, { signal: controller.signal }).then((stores) => {
            if (mounted.current && !controller.signal.aborted) dispatch({ type: "loaded", stores });
        }).catch((error: unknown) => {
            if (mounted.current && !controller.signal.aborted) dispatch({ type: "error", message: error instanceof Error ? error.message : "Erro ao carregar filiais." });
        });
    }, [profileId]);

    useEffect(() => {
        mounted.current = true;
        reload();
        return () => {
            mounted.current = false;
            loadController.current?.abort();
            mutationController.current?.abort();
        };
    }, [reload]);

    const mutate = useCallback(async (operation: (signal: AbortSignal) => Promise<Store[]>, message: string): Promise<boolean> => {
        if (mutationController.current !== null || !mounted.current) return false;
        const controller = new AbortController();
        mutationController.current = controller;
        dispatch({ type: "start" });
        try {
            const stores = await operation(controller.signal);
            if (!mounted.current || controller.signal.aborted) return false;
            dispatch({ type: "saved", stores, message });
            return true;
        } catch (error) {
            if (mounted.current && !controller.signal.aborted) dispatch({ type: "error", message: error instanceof Error ? error.message : "Não foi possível concluir a operação." });
            return false;
        } finally {
            if (mutationController.current === controller) mutationController.current = null;
        }
    }, []);

    const addStore = useCallback((data: StoreFormData): Promise<boolean> => mutate((signal) => createStore(profileId, data, { signal }), "Filial cadastrada com sucesso."), [mutate, profileId]);
    const editStore = useCallback((id: string, data: StoreFormData): Promise<boolean> => mutate((signal) => updateStore(profileId, id, data, { signal }), "Loja atualizada com sucesso."), [mutate, profileId]);
    const removeStore = useCallback((id: string): Promise<boolean> => mutate((signal) => deleteStore(profileId, id, { signal }), "Loja excluída com sucesso."), [mutate, profileId]);
    const clearFeedback = useCallback((): void => dispatch({ type: "clear" }), []);
    const clearError = useCallback((): void => dispatch({ type: "clear-error" }), []);

    // As páginas consomem a mesma coleção sem repassar dados e operações pelo layout.
    return useMemo(() => ({ ...state, addStore, editStore, removeStore, reload, clearFeedback, clearError }), [state, addStore, editStore, removeStore, reload, clearFeedback, clearError]);
}
