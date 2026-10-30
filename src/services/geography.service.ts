export interface GeographyRequestOptions { signal?: AbortSignal; }

// Malha estática local do IBGE. Não depende de um serviço externo durante o uso.
export async function getBrazilStatesMap(options: GeographyRequestOptions = {}): Promise<string> {
    try {
        const { default: brazilStatesSource } = await import("../../assets/maps/brazil-states.geo.json?raw");
        options.signal?.throwIfAborted();
        return brazilStatesSource;
    } catch (error) {
        if (options.signal?.aborted) throw error;
        throw new Error("Não foi possível carregar o mapa do Brasil.", { cause: error });
    }
}
