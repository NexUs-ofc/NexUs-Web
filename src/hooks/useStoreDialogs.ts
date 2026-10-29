import { useCallback, useState } from "react";
import type { Store, StoreDialogState, StoreFormData } from "../types/store";
import { useStoresContext } from "./useStoresContext";

export interface UseStoreDialogsResult {
    dialog: StoreDialogState;
    saving: boolean;
    error: string;
    openEdit: (store: Store) => void;
    openDelete: (store: Store) => void;
    close: () => void;
    save: (data: StoreFormData) => Promise<boolean>;
    confirmDelete: () => Promise<void>;
}

export function useStoreDialogs(): UseStoreDialogsResult {
    const [dialog, setDialog] = useState<StoreDialogState>({ kind: "closed" });
    const { saving, error, clearFeedback, clearError, editStore, removeStore } = useStoresContext();

    const openEdit = useCallback((store: Store): void => { clearFeedback(); setDialog({ kind: "edit", store }); }, [clearFeedback]);
    const openDelete = useCallback((store: Store): void => { clearFeedback(); setDialog({ kind: "delete", store }); }, [clearFeedback]);
    const close = useCallback((): void => { clearError(); setDialog({ kind: "closed" }); }, [clearError]);
    const save = useCallback(async (data: StoreFormData): Promise<boolean> => {
        if (dialog.kind !== "edit") return false;
        return editStore(dialog.store.id, data);
    }, [dialog, editStore]);
    const confirmDelete = useCallback(async (): Promise<void> => {
        if (dialog.kind === "delete" && await removeStore(dialog.store.id)) close();
    }, [dialog, removeStore, close]);

    return { dialog, saving, error, openEdit, openDelete, close, save, confirmDelete };
}
