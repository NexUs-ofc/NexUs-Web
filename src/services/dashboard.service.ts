import { MOCK_DASHBOARD } from "../mocks/dashboard";
import type { DashboardData } from "../types/dashboard";
import { toValidatedDashboard } from "../utils/validateDashboard";

export interface DashboardRequestOptions { signal?: AbortSignal; }

export async function getDashboard(options: DashboardRequestOptions = {}): Promise<DashboardData> {
    try {
        await Promise.resolve();
        options.signal?.throwIfAborted();
        // Quando o contrato HTTP existir, substituir somente esta origem por coreRequest<unknown>(...).
        // Manter o AbortSignal e o adaptador de validação antes de devolver os dados à UI.
        return toValidatedDashboard(MOCK_DASHBOARD);
    } catch (error) {
        if (options.signal?.aborted) throw error;
        throw new Error("Não foi possível carregar os dados do dashboard. Tente novamente.", { cause: error });
    }
}
