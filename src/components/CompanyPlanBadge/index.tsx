import "../../../styles/components/CompanyPlanBadge/company-plan-badge.css";

function normalizePlanName(value: string): string {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/gu, "").trim().replace(/^plano\s+/iu, "").toLocaleLowerCase("pt-BR");
}

export interface CompanyPlanBadgeProps {
    planName: string;
}

export default function CompanyPlanBadge({ planName }: CompanyPlanBadgeProps) {
    const normalizedName = normalizePlanName(planName);
    const knownPlans = {
        ceris: { label: "Plano Ceris", style: "company-plan-badge--ceris" },
        enterprise: { label: "Plano Enterprise", style: "company-plan-badge--enterprise" },
        exclusive: { label: "Plano Exclusive", style: "company-plan-badge--exclusive" },
    } as const;
    const plan = knownPlans[normalizedName as keyof typeof knownPlans];
    const label = plan?.label ?? `Plano ${planName.trim()}`;
    const style = plan?.style ?? "company-plan-badge--ceris";

    return <span className={`company-plan-badge ${style}`}>{label}</span>;
}
