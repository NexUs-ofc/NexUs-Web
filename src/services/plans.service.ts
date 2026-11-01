import { parseCompany } from "../utils/parseProfile";
import { validatePlanId } from "../utils/validateRegistration";
import type { Company } from "../types/company";
import type { Plan } from "../types/plan";
import { toValidatedPlans } from "../utils/validatePlans";
import { apiRequest } from "./apiClient";
import { ApiError } from "./apiError";
import { CORE_API_BASE_URL, coreRequest } from "./coreClient";

interface PlansRequestOptions {
    signal?: AbortSignal;
}

export async function getCompany(options: PlansRequestOptions = {}): Promise<Company> {
    try {
        const company = await coreRequest<unknown>("/api/companies/me", options);
        return parseCompany(company);
    } catch (error) {
        if (error instanceof ApiError && error.message === "Erro ao comunicar com o servidor.") {
            throw new ApiError("A consulta do plano atual está indisponível. Tente novamente mais tarde.", error.status);
        }
        throw error;
    }
}

export async function getPlans(options: PlansRequestOptions = {}): Promise<Plan[]> {
    try {
        const data = await apiRequest<unknown>(CORE_API_BASE_URL, "/api/plans", {
            ...options,
            credentials: "omit",
        });
        return toValidatedPlans(data);
    } catch (error) {
        if (error instanceof ApiError) {
            throw new ApiError("Não foi possível consultar os planos disponíveis. Tente novamente mais tarde.", error.status);
        }
        throw error;
    }
}

export async function changeCompanyPlan(planId: number, options: PlansRequestOptions = {}): Promise<Company> {
    const error = validatePlanId(planId);
    if (error) throw new Error(error);
    const company = await coreRequest<unknown>("/api/companies/me/plan", {
        ...options,
        method: "PATCH",
        body: { planId },
    });
    return parseCompany(company);
}
