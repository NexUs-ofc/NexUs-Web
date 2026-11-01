import PageTitle from "../../components/PageTitle";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlanCard from "../../components/PlanCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { usePlans } from "../../hooks/usePlans";
import { useRegistration } from "../../hooks/useRegistration";
import { REGISTRATION_INITIAL_DATA } from "../../types/registration";
import type { RegistrationData } from "../../types/registration";
import { loadRegistrationDraft } from "../../utils/registrationStorage";
import "../../../styles/pages/PlansPage/plans-page.css";

export default function PlansPage() {
    const navigate = useNavigate();
    const { loading: registering, execute } = useRegistration();
    const { plans, loading, error, reload } = usePlans();
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [draft] = useState<RegistrationData | null>(() => loadRegistrationDraft() ?? null);

    const handleContract = useCallback(
        async (planId: number): Promise<void> => {
            if (registering || loading || !plans.some((plan) => plan.id === planId)) return;
            setSelectedPlanId(planId);
            const updated: RegistrationData = {
                ...(draft ?? REGISTRATION_INITIAL_DATA),
                planId,
            };
            const result = await execute(updated);
            if (result.success) {
                navigate("/cadastro/verificacao");
            } else {
                navigate("/cadastro", {
                    state: { registrationError: result.error ?? "Erro ao iniciar o cadastro. Tente novamente." },
                });
            }
        },
        [draft, execute, loading, navigate, plans, registering],
    );

    if (registering) {
        return <main aria-label="Iniciando cadastro"><LoadingSpinner message="Iniciando seu cadastro..." /></main>;
    }

    return (
        <div className="plansPage">
            <main>
                <header className="plansHeader">
                    <PageTitle className="plansTitle">Escolha o plano ideal para o seu negócio</PageTitle>
                    <p className="plansSubtitle">
                        Compare funcionalidades, escalabilidade e suporte para encontrar a melhor opção para a sua operação.
                    </p>
                </header>
                {loading ? <LoadingSpinner message="Carregando os planos disponíveis..." /> : error ? (
                    <div className="plansError" role="alert">
                        <p>{error}</p>
                        <button type="button" className="plansRetry" onClick={reload}>Tentar novamente</button>
                    </div>
                ) : plans.length === 0 ? (
                    <p className="plansNotice" role="status">Nenhum plano está disponível para contratação no momento.</p>
                ) : (
                    <div className="plansContainer" aria-label="Planos disponíveis">
                        {plans.map((plan) => (
                            <PlanCard
                                key={plan.id}
                                {...plan}
                                selected={selectedPlanId === plan.id}
                                actionLabel="Contratar Plano"
                                actionAriaLabel="Contratar o plano"
                                onAction={handleContract}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
