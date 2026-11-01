import type { Plan } from "../types/plan";
import { PLAN_PRESENTATIONS } from "../config/plans";

const priceFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function toValidatedPlans(data: unknown): Plan[] {
    if (!Array.isArray(data)) {
        throw new Error("Não foi possível carregar os planos disponíveis. Tente novamente.");
    }
    const ids = new Set<number>();
    const plansByName = new Map<string, { id: number; price: number }>();
    for (const item of data as unknown[]) {
        if (typeof item !== "object" || item === null) {
            throw new Error("Os dados dos planos estão inválidos. Tente novamente mais tarde.");
        }
        const { id, planName, planPrice } = item as Record<string, unknown>;
        if (
            typeof id !== "number" || !Number.isSafeInteger(id) || id < 1 || ids.has(id) ||
            typeof planName !== "string" || planName.trim() === "" ||
            typeof planPrice !== "number" || !Number.isFinite(planPrice) || planPrice < 0
        ) {
            throw new Error("Os dados dos planos estão inválidos. Tente novamente mais tarde.");
        }
        ids.add(id);
        const name = planName.trim().toLocaleLowerCase("pt-BR");
        if (plansByName.has(name)) {
            throw new Error("Não foi possível identificar os planos disponíveis. Tente novamente mais tarde.");
        }
        plansByName.set(name, { id, price: planPrice });
    }
    return PLAN_PRESENTATIONS.flatMap((presentation) => {
        const plan = plansByName.get(presentation.title.toLocaleLowerCase("pt-BR"));
        return plan ? [{ ...presentation, id: plan.id, price: priceFormatter.format(plan.price) }] : [];
    });
}
