import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStoresContext } from "./useStoresContext";
import { useStoreDetails } from "./useStoreDetails";
import { resolveStoreRouteId } from "../utils/storeRoute";
import { toStoreForm } from "../utils/validateStore";
import type { StoreFormData } from "../types/store";

export function useEditStorePage() {
    const { id: routeId } = useParams<{ id: string }>();
    const route = resolveStoreRouteId(routeId);
    const collection = useStoresContext();
    const summary = collection.stores.find((store) => store.id === route.id);
    const details = useStoreDetails(route.id, summary);
    const navigate = useNavigate();
    const { clearFeedback } = collection;

    useEffect(() => {
        document.title = "Editar Filial — NexUs";
        clearFeedback();
    }, [route.id, clearFeedback]);

    const error = route.error || details.error;
    const initialData = details.store ? toStoreForm(details.store) : null;
    const save = (data: StoreFormData): Promise<boolean> => route.id === undefined ? Promise.resolve(false) : collection.editStore(route.id, data);
    const back = (): void => { void navigate("/lojas"); };
    return { details, collection, error, route, initialData, save, back };
}
