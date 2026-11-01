import type { CompanyDetails } from "../types/company";
import { coreRequest } from "./coreClient";

export interface CompanyRequestOptions {
    signal?: AbortSignal;
}

export async function getCompanyDetails(options: CompanyRequestOptions = {}): Promise<CompanyDetails> {
    return coreRequest<CompanyDetails>("/api/companies/me", {
        method: "GET",
        ...(options.signal ? { signal: options.signal } : {}),
    });
}
