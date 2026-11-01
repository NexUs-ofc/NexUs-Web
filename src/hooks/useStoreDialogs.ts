import { useCallback, useState } from "react";
import type { Store, StoreDialogState } from "../types/store";
import { useStoresContext } from "./useStoresContext";

export interface UseStoreDialogsResult {
    dialog: StoreDialogState;
    saving: boolean;
    error: string;
    openDelete: (store: Store) => void;
    close: () => void;
    confirmDelete: () => Promise<void>;
}

export function useStoreDialogs(): UseStoreDialogsResult {
    const [dialog, setDialog] = useState<StoreDialogState>({ kind: "closed" });
    const { saving, error, clearFeedback, clearError, removeStore } = useStoresContext();

    const openDelete = useCallback((store: Store): void => { clearFeedback(); setDialog({ kind: "delete", store }); }, [clearFeedback]);
    const close = useCallback((): void => { clearError(); setDialog({ kind: "closed" }); }, [clearError]);
    const confirmDelete = useCallback(async (): Promise<void> => {
        if (dialog.kind === "delete" && await removeStore(dialog.store.id)) close();
    }, [dialog, removeStore, close]);

    return { dialog, saving, error, openDelete, close, confirmDelete };
}
