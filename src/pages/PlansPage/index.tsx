import PageFooter from "../../components/PageFooter";
import { Link } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import PlanCard from "../../components/PlanCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import "../../../styles/pages/PlansPage/plans-page.css";
import { usePlansPage } from "../../hooks/usePlansPage";

export default function PlansPage() {
    const { registering, plans, loading, error, reload, selectedPlanId, handleContract } = usePlansPage();
    return (
        <div className="plansPage">
            <main>
                <header className="plansHeader" role="banner">
                    <nav aria-label="Acesso à conta"><Link to="/cadastro">Voltar ao cadastro</Link></nav>
                    <PageTitle className="plansTitle">Escolha o plano ideal para o seu negócio</PageTitle>
                    <p className="plansSubtitle">
                        Compare funcionalidades, escalabilidade e suporte para encontrar a melhor opção para a sua operação.
                    </p>
                </header>
                {registering ? <LoadingSpinner message="Iniciando seu cadastro..." /> : loading ? <LoadingSpinner message="Carregando os planos disponíveis..." /> : error ? (
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
            <PageFooter />
        </div>
    );
}
