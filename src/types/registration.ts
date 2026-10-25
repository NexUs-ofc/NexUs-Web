export type RegistrationType = "COMPANY";

export interface Plan {
    id: number;
    title: string;
    price: string;
    priceSuffix: string;
    subtitle: string;
    featured: boolean;
    benefits: string[];
}

export interface RegistrationData {
    type: RegistrationType;
    email: string;
    password: string;
    name: string;
    phones: string[];
    cnpj: string;
    planId: number;
}

export interface RegistrationErrors {
    type: string;
    email: string;
    password: string;
    name: string;
    phones: string;
    cnpj: string;
    planId: string;
}

export const REGISTRATION_MAX_LENGTH = {
    email: 254,
    password: 128,
    name: 100,
    cnpj: 18,
    phone: 15,
} as const;

export const REGISTRATION_INITIAL_DATA: RegistrationData = {
    type: "COMPANY",
    email: "",
    password: "",
    name: "",
    phones: [],
    cnpj: "",
    planId: -1,
};

export const REGISTRATION_INITIAL_ERRORS: RegistrationErrors = {
    type: "",
    email: "",
    password: "",
    name: "",
    phones: "",
    cnpj: "",
    planId: "",
};

export interface RegistrationStartResponse {
    registrationId: string;
}

export const AVAILABLE_PLANS: Plan[] = [
    {
        id: 0,
        title: "Ceris",
        price: "R$359,99",
        priceSuffix: "/licença por mês",
        subtitle: "Funcionalidades limitadas",
        featured: false,
        benefits: [
            "Visualização de filiais próximas ao cliente",
            "Insights sobre vendas em regiões próximas",
            "Produtos mais desejados por período e por região",
            "Dashboard estratégico com os produtos cadastrados no estoque do cliente"
        ],
    },
    {
        id: 1,
        title: "Enterprise",
        price: "R$659,99",
        priceSuffix: "/licença por mês",
        subtitle: "Funcionalidades limitadas",
        featured: true,
        benefits: [
            "IA",
            "Visualização de filiais próximas ao cliente",
            "Insights sobre vendas em regiões próximas",
            "Produtos mais desejados por período e por região",
            "Dashboard estratégico com os produtos cadastrados no estoque do cliente"
        ],
    },
    {
        id: 2,
        title: "Exclusive",
        price: "R$959,99",
        priceSuffix: "/licença por mês",
        subtitle: "Funcionalidades limitadas",
        featured: false,
        benefits: [
            "IA + Relatórios",
            "Visualização de filiais próximas ao cliente",
            "Insights sobre vendas em regiões próximas",
            "Produtos mais desejados por período e por região",
            "Dashboard estratégico com os produtos cadastrados no estoque do cliente"
        ],
    },
];
