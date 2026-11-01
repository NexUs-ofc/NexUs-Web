// Leitores defensivos para JSON de APIs externas: nada chega à interface sem passar por aqui.

export function asRecord(value: unknown): Record<string, unknown> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("Resposta da API inválida.");
    return value as Record<string, unknown>;
}

export function asText(value: unknown, maxLength = 100): string {
    if (typeof value !== "string") throw new Error("Texto da API inválido.");
    // Somente texto simples chega aos gráficos e à interpolação JSX; nunca HTML externo.
    const sanitized = value.normalize("NFC").replace(/<[^>]*>/gu, "").replace(/[\p{Cc}{}]/gu, "").trim();
    if (sanitized.length === 0 || sanitized.length > maxLength) throw new Error("Texto da API vazio ou muito longo.");
    return sanitized;
}

export function asNumber(value: unknown, max = Number.MAX_SAFE_INTEGER): number {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > max) throw new Error("Valor numérico da API inválido.");
    return value;
}

export function asList<T extends { id: string }>(value: unknown, parse: (item: Record<string, unknown>) => T): T[] {
    if (!Array.isArray(value)) throw new Error("Lista da API inválida.");
    const entries = value.map((item: unknown) => parse(asRecord(item)));
    if (new Set(entries.map((item) => item.id)).size !== entries.length) throw new Error("Identificadores duplicados na resposta da API.");
    return entries;
}
