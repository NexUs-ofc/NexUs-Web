import type { CepAddress } from "../types/cep";
import { BRAZILIAN_STATES } from "../utils/validateStore";

export interface CepRequestOptions { signal?: AbortSignal; }

const CEP_LOOKUP_ERROR = "Não foi possível consultar o CEP. Tente novamente ou preencha o endereço manualmente.";

export async function getAddressByCep(cep: string, options: CepRequestOptions = {}): Promise<CepAddress> {
    const digits = cep.replace(/\D/gu, "");
    if (!/^\d{8}$/u.test(digits)) throw new Error("Informe um CEP com 8 dígitos.");
    let data: unknown;
    try {
        // Mesmo endpoint do mobile. A consulta pública não recebe credenciais do Core/Auth.
        const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
            credentials: "omit",
            signal: AbortSignal.any([AbortSignal.timeout(10_000), ...(options.signal ? [options.signal] : [])]),
        });
        if (!response.ok) throw new Error(CEP_LOOKUP_ERROR);
        data = await response.json();
    } catch (error) {
        if (options.signal?.aborted) throw error;
        throw new Error(CEP_LOOKUP_ERROR, { cause: error });
    }
    if (typeof data !== "object" || data === null) throw new Error(CEP_LOOKUP_ERROR);
    const address = data as Record<string, unknown>;
    if (address.erro === true || address.erro === "true") throw new Error("CEP não encontrado. Confira os 8 dígitos ou preencha o endereço manualmente.");
    if (typeof address.cep !== "string" || address.cep.replace(/\D/gu, "") !== digits
        || typeof address.localidade !== "string" || !address.localidade.trim()
        || typeof address.uf !== "string" || !BRAZILIAN_STATES.includes(address.uf)) throw new Error(CEP_LOOKUP_ERROR);
    return {
        street: typeof address.logradouro === "string" ? address.logradouro : "",
        neighborhood: typeof address.bairro === "string" ? address.bairro : "",
        city: address.localidade,
        state: address.uf,
    };
}
