import { useCallback, useState } from "react";
import PlanCard from "../../components/PlanCard";
import { AVAILABLE_PLANS } from "../../types/registration";
import "../../../styles/pages/PlansPage/plans-page.css";
import "../../../styles/pages/UpdatePlansPage/update-plans-page.css";

export default function UpdatePlansPage() {
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

    const handlePlanUpdate = useCallback((planId: number): void => {
        setSelectedPlanId(planId);
    }, []);

    const selectedPlan = AVAILABLE_PLANS.find((plan) => plan.id === selectedPlanId);

    return (
        <div className="plansPage updatePlansPage">
            <main>
                <header className="plansHeader">
                    <h1 className="plansTitle">Atualize seu plano</h1>
                    <p className="plansSubtitle">
                        Compare os planos disponíveis e selecione a opção que melhor atende à sua operação.
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
                            actionLabel="Atualizar Plano"
                            actionAriaLabel="Selecionar para atualização de plano"
                            onAction={handlePlanUpdate}
                        />
                    ))}
                </div>
                {selectedPlan ? (
                    <p className="plansSuccess" role="status">
                        Plano {selectedPlan.title} selecionado para atualização.
                    </p>
                ) : null}
            </main>
        </div>
    );
}
