import { useContext } from "react";
import { StoresContext } from "../contexts/StoresContext";
import type { UseStoreCollectionResult } from "./useStoreCollection";

export function useStoresContext(): UseStoreCollectionResult {
    const context = useContext(StoresContext);
    if (context === null) throw new Error("useStoresContext deve ser usado dentro de StoresProvider.");
    return context;
}
