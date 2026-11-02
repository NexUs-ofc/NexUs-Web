import { useCallback, useEffect, useState } from "react";
import { getAddressByCep } from "../services/address.service";
import type { PostalAddress } from "../types/address";

interface AddressLookupState {
    cep: string;
    address: PostalAddress | null;
    error: string;
    revision: number;
}

export interface UseAddressLookupResult {
    address: PostalAddress | null;
    loading: boolean;
    error: string;
    retry: () => void;
}

export function useAddressLookup(cep: string, onResolved: (address: PostalAddress) => void): UseAddressLookupResult {
    const digits = cep.replace(/\D/gu, "");
    const complete = digits.length === 8;
    const [state, setState] = useState<AddressLookupState>({ cep: "", address: null, error: "", revision: 0 });

    useEffect(() => {
        if (digits.length !== 8) return;
        const controller = new AbortController();
        const timer = setTimeout(() => {
            void getAddressByCep(digits, { signal: controller.signal }).then((address) => {
                if (controller.signal.aborted) return;
                onResolved(address);
                setState((previous) => ({ ...previous, cep: digits, address, error: "" }));
            }).catch((error: unknown) => {
                if (!controller.signal.aborted) setState((previous) => ({ ...previous, cep: digits, address: null,
                    error: error instanceof Error ? error.message : "Não foi possível consultar o CEP. Tente novamente.",
                }));
            });
        }, 300);
        return () => { clearTimeout(timer); controller.abort(); };
    }, [digits, state.revision, onResolved]);

    const retry = useCallback((): void => setState((previous) => ({ cep: "", address: null, error: "", revision: previous.revision + 1 })), []);
    // A consulta anterior nunca confirma nem bloqueia um CEP diferente do atual.
    const current = complete && state.cep === digits;
    return { address: current ? state.address : null, loading: complete && !current, error: current ? state.error : "", retry };
}
