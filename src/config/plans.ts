import type { Plan } from "../types/plan";

const sharedBenefits = [
    "Visualização de filiais próximas ao cliente",
    "Insights sobre vendas em regiões próximas",
    "Produtos mais desejados por período e por região",
    "Dashboard estratégico com os produtos cadastrados no estoque do cliente",
];

export const PLAN_PRESENTATIONS: Omit<Plan, "id" | "price">[] = [
    {
        title: "Ceris",
        priceSuffix: "/licença por mês",
        subtitle: "Funcionalidades limitadas",
        benefits: [...sharedBenefits],
    },
    {
        title: "Enterprise",
        priceSuffix: "/licença por mês",
        subtitle: "Funcionalidades limitadas",
        benefits: ["IA", ...sharedBenefits],
    },
    {
        title: "Exclusive",
        priceSuffix: "/licença por mês",
        subtitle: "Funcionalidades limitadas",
        benefits: ["IA + Relatórios", ...sharedBenefits],
    },
];
