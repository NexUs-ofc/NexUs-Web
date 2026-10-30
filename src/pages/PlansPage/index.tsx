import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlanCard from "../../components/PlanCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useRegistration } from "../../hooks/useRegistration";
import { AVAILABLE_PLANS, REGISTRATION_INITIAL_DATA } from "../../types/registration";
import type { RegistrationData } from "../../types/registration";
import { loadRegistrationDraft } from "../../utils/registrationStorage";
import "../../../styles/pages/PlansPage/plans-page.css";

export default function PlansPage() {
    const navigate = useNavigate();
    const { loading, execute } = useRegistration();
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [draft] = useState<RegistrationData | null>(() => {
        return loadRegistrationDraft() ?? null;
    });

    const handleContract = useCallback(
        async (planId: number): Promise<void> => {
            setSelectedPlanId(planId);
            const nextDraft = draft ?? REGISTRATION_INITIAL_DATA;
            const updated: RegistrationData = {
                ...nextDraft,
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
        [draft, execute, navigate],
    );

    if (loading) {
        return <LoadingSpinner message="Iniciando seu cadastro..." />;
    }

    return (
        <div className="plansPage">
            <main>
                <header className="plansHeader">
                    <h1 className="plansTitle">Escolha o plano ideal para o seu negócio</h1>
                    <p className="plansSubtitle">
                        Compare funcionalidades, escalabilidade e suporte para encontrar a melhor opção para a sua operação.
                    </p>
                </header>
                <div className="plansContainer">
                    {AVAILABLE_PLANS.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            id={plan.id}
                            title={plan.title}
                            price={plan.price}
                            priceSuffix={plan.priceSuffix}
                            subtitle={plan.subtitle}
                            featured={plan.featured}
                            benefits={plan.benefits}
                            selected={selectedPlanId === plan.id}
                            actionLabel="Contratar Plano"
                            actionAriaLabel="Contratar o plano"
                            onAction={handleContract}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
