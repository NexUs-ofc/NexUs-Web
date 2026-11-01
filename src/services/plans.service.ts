import type { Company } from "../types/company";
import { coreRequest } from "./coreClient";

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
    const company = await coreRequest<Company>("/api/companies/me", options);
    return validateCompany(company);
}

export async function changeCompanyPlan(planId: number, options: PlansRequestOptions = {}): Promise<Company> {
    const company = await coreRequest<Company>("/api/companies/me/plan", {
        ...options,
        method: "PATCH",
        body: { planId },
    });
    return validateCompany(company);
}
