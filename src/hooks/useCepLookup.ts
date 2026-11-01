import { useEffect, useRef, useState } from "react";
import { getAddressByCep } from "../services/cep.service";
import type { CepAddress, CepLookupState } from "../types/cep";

export function useCepLookup(onFound: (address: CepAddress, cep: string) => void) {
    const [state, setState] = useState<CepLookupState>({ loading: false, error: "", message: "" });
    const controllerRef = useRef<AbortController | null>(null);
    useEffect(() => () => controllerRef.current?.abort(), []);

    async function lookup(value: string): Promise<void> {
        controllerRef.current?.abort();
        controllerRef.current = null;
        const cep = value.replace(/\D/gu, "");
        if (cep.length !== 8) {
            setState({ loading: false, error: "", message: "" });
            return;
        }
        const controller = new AbortController();
        controllerRef.current = controller;
        setState({ loading: true, error: "", message: "" });
        try {
            const address = await getAddressByCep(cep, { signal: controller.signal });
            if (controller.signal.aborted) return;
            onFound(address, cep);
            setState({ loading: false, error: "", message: address.street && address.neighborhood
                ? "Endereço encontrado. Confira os dados e informe o número."
                : "CEP encontrado. Complete os campos de endereço que faltarem." });
        } catch (error) {
            if (!controller.signal.aborted) setState({ loading: false, error: error instanceof Error ? error.message : "Não foi possível consultar o CEP. Preencha o endereço manualmente.", message: "" });
        } finally {
            if (controllerRef.current === controller) controllerRef.current = null;
        }
    }

    return { ...state, lookup };
}
