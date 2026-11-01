import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStoresContext } from "./useStoresContext";

export function useCreateStorePage() {
    const { addStore, saving, loading, error } = useStoresContext();
    const navigate = useNavigate();
    useEffect(() => {
        document.title = "Adicionar Nova Filial — NexUs";
    }, []);

    const back = (): void => { void navigate("/lojas"); };
    return { addStore, saving, loading, error, back };
}
