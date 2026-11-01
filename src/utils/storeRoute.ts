import { validateStoreId } from "./parseStore";

export interface StoreRouteResult { id: string | undefined; error: string; }

export function resolveStoreRouteId(value: string | undefined): StoreRouteResult {
    if (value === undefined || value === "") return { id: undefined, error: "Informe o identificador da filial na URL." };
    try {
        return { id: String(Number(validateStoreId(value))), error: "" };
    } catch {
        return { id: undefined, error: "O identificador da filial na URL é inválido." };
    }
}
