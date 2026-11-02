import type { Store } from "../types/store";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStores } from "./useStores";
import { useStoresContext } from "./useStoresContext";
import { useStoreDialogs } from "./useStoreDialogs";

export function useStoresPage() {
    const { stores, filters, cities, states, setSearch, setCity, setState } = useStores();
    const collection = useStoresContext();
    const modal = useStoreDialogs();
    const navigate = useNavigate();
    const { clearFeedback } = collection;
    const openEdit = useCallback((store: Store): void => {
        clearFeedback();
        navigate(`/lojas/editar/${encodeURIComponent(store.id)}`);
    }, [clearFeedback, navigate]);

    useEffect(() => {
        document.title = "Filiais Cadastradas — NexUs";
    }, []);

    const createNew = (): void => { collection.clearFeedback(); navigate("/lojas/nova"); };
    return { stores, filters, cities, states, setSearch, setCity, setState, collection, modal, openEdit, createNew };
}
