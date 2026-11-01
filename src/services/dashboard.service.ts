import type { DashboardData } from "../types/dashboard";
import { toValidatedDashboard } from "../utils/validateDashboard";
import { describeReportsError, reportsRequest } from "./reportsClient";

export interface DashboardRequestOptions { signal?: AbortSignal; }

export async function getDashboard(options: DashboardRequestOptions = {}): Promise<DashboardData> {
    try {
        // GET /dashboard devolve o formato DashboardData; a validação protege a interface de respostas inesperadas.
        const data = await reportsRequest<unknown>("/dashboard", options.signal ? { signal: options.signal } : {});
        return toValidatedDashboard(data);
    } catch (error) {
        if (options.signal?.aborted) throw error;
        const fallback = "Não foi possível carregar os dados do dashboard. Tente novamente.";
        throw new Error(describeReportsError(error, fallback), { cause: error });
    }
}
