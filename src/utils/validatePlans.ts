import type { Plan } from "../types/plan";

const priceFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function toValidatedPlans(data: unknown): Plan[] {
    if (!Array.isArray(data)) {
        throw new Error("Não foi possível carregar os planos disponíveis. Tente novamente.");
    }
    const ids = new Set<number>();
    return data.map((item: unknown) => {
        if (typeof item !== "object" || item === null) {
            throw new Error("Os dados dos planos estão inválidos. Tente novamente mais tarde.");
        }
        const { id, planName, planPrice, description } = item as Record<string, unknown>;
        if (
            typeof id !== "number" || !Number.isSafeInteger(id) || id < 1 || ids.has(id) ||
            typeof planName !== "string" || planName.trim() === "" ||
            typeof planPrice !== "number" || !Number.isFinite(planPrice) || planPrice < 0 ||
            (description !== null && typeof description !== "string")
        ) {
            throw new Error("Os dados dos planos estão inválidos. Tente novamente mais tarde.");
        }
        ids.add(id);
        return {
            id,
            title: planName.trim(),
            price: priceFormatter.format(planPrice),
            priceSuffix: "/licença por mês",
            subtitle: "Assinatura mensal",
            benefits: typeof description === "string"
                ? [...new Set(description.split(/\r?\n/u).map((line) => line.trim()).filter(Boolean))]
                : [],
        };
    });
}
