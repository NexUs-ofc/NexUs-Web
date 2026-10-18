import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import PlanCard from "../../components/PlanCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import { AVAILABLE_PLANS } from "../../types/registration";
import type { RegistrationData } from "../../types/registration";
import {
    clearRegistrationDraft,
    loadRegistrationDraft,
    saveRegistrationDraft,
} from "../../utils/registrationStorage";
import {
    isRegistrationFormValid,
    validateRegistrationForm,
} from "../../utils/validateRegistration";
import "./plans-page.css";

export default function PlansPage() {
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [draft] = useState<RegistrationData | null>(() => {
        return loadRegistrationDraft() ?? null;
    });

    const handleContract = useCallback(
        (planId: number): void => {
            setSelectedPlanId(planId);
            setIsLoading(true);
            setError("");

            const nextDraft: RegistrationData = draft ?? {
                type: "COMPANY",
                email: "",
                password: "",
                name: "",
                phones: [],
                cnpj: "",
                planId: -1,
            };

            const updated = {
                ...nextDraft,
                planId,
            };

            const errors = validateRegistrationForm(updated);
            if (!isRegistrationFormValid(errors)) {
                setIsLoading(false);
                setError("Preencha os dados do cadastro antes de contratar o plano.");
                return;
            }

            saveRegistrationDraft(updated);
            clearRegistrationDraft();

            setIsLoading(false);
            setSuccess(true);
        },
        [draft],
    );

    if (isLoading) {
        return <LoadingSpinner message="Processando sua escolha..." />;
    }

    if (success) {
        return (
            <div className="plansPage">
                <main>
                    <div className="plansSuccess">
                        <h2 className="plansSuccessTitle">Plano contratado com sucesso!</h2>
                        <p>
                            Sua escolha foi salva. Continue o cadastro para finalizar a criação da conta.
                        </p>
                        <p>
                            <Link to="/login" className="plansSuccessLink">
                                Ir para o login
                            </Link>
                        </p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="plansPage">
            {error !== "" ? <ErrorAlert title="Não foi possível contratar o plano" message={error} /> : null}
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
                            onContract={handleContract}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
}
