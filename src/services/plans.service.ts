import type { Company } from "../types/company";
import type { Plan } from "../types/plan";
import { toValidatedPlans } from "../utils/validatePlans";
import { apiRequest } from "./apiClient";
import { ApiError } from "./apiError";
import { CORE_API_BASE_URL, coreRequest } from "./coreClient";

interface PlansRequestOptions {
    signal?: AbortSignal;
}

function validateCompany(data: Company): Company {
    if (
        !data || !Number.isInteger(data.id) || data.id < 1 ||
        !Number.isInteger(data.planId) || data.planId < 1 ||
        typeof data.planName !== "string" || data.planName.trim() === ""
    ) {
        throw new Error("Não foi possível identificar o plano atual da empresa. Tente novamente.");
    }
    return data;
}

export async function getCompany(options: PlansRequestOptions = {}): Promise<Company> {
    try {
        const company = await coreRequest<Company>("/api/companies/me", options);
        return validateCompany(company);
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
    const company = await coreRequest<Company>("/api/companies/me/plan", {
        ...options,
        method: "PATCH",
        body: { planId },
    });
    return validateCompany(company);
}
