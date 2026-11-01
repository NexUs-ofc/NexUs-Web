import PageTitle from "../../components/PageTitle";
import PlanCard from "../../components/PlanCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useCompanyPlan } from "../../hooks/useCompanyPlan";
import "../../../styles/pages/PlansPage/plans-page.css";
import "../../../styles/pages/UpdatePlansPage/update-plans-page.css";

export default function UpdatePlansPage() {
    const { company, plans, loading, pendingPlanId, error, success, reload, changePlan } = useCompanyPlan();

    return (
        <div className="plansPage updatePlansPage">
            <main>
                <header className="plansHeader">
                    <PageTitle className="plansTitle">Escolha o plano ideal para o seu negócio</PageTitle>
                    <p className="plansSubtitle">
                        Compare funcionalidades, escalabilidade e suporte para encontrar a melhor opção para a sua operação.
                    </p>
                </header>
                {loading ? <LoadingSpinner message="Carregando o plano da empresa..." /> : (
                    <>
                        {error ? (
                            <div className="plansError" role="alert">
                                <p>{error}</p>
                                <button type="button" className="plansRetry" onClick={reload} disabled={pendingPlanId !== null}>Tentar novamente</button>
                            </div>
                        ) : null}
                        {success ? <p className="plansSuccess" role="status">{success}</p> : null}
                        {!error && plans.length === 0 ? (
                            <p className="plansNotice" role="status">Nenhum plano está disponível para contratação no momento.</p>
                        ) : null}
                        {company && plans.length > 0 && !plans.some((plan) => plan.id === company.planId) ? (
                            <p className="plansNotice" role="status">Seu plano atual é {company.planName} e não está disponível para novas contratações. Conheça as opções abaixo.</p>
                        ) : null}
                        <div className="plansContainer" aria-label="Planos disponíveis" aria-busy={pendingPlanId !== null}>
                            {plans.map((plan) => {
                                const selected = company?.planId === plan.id;
                                const pending = pendingPlanId === plan.id;
                                return (
                                    <PlanCard
                                        key={plan.id}
                                        {...plan}
                                        selected={selected}
                                        disabled={!company || selected || pendingPlanId !== null}
                                        pending={pending}
                                        actionLabel={selected ? "Plano Atual" : pending ? "Contratando..." : "Contratar Plano"}
                                        actionAriaLabel={selected ? "Plano atual:" : pending ? "Contratando o plano" : "Contratar o plano"}
                                        onAction={changePlan}
                                    />
                                );
                            })}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
