import type { Store } from "../types/store";

// Dados demonstrativos da tela do Figma, sem comunicação com o back-end.
export const MOCK_STORES: ReadonlyArray<Store> = [
    { id: "mock-pinheiros", name: "São Paulo Pinheiros", city: "São Paulo", state: "SP" },
    { id: "mock-campinas", name: "Campinas Centro", city: "Campinas", state: "SP" },
    { id: "mock-copacabana", name: "Rio de Janeiro Copacabana", city: "Rio de Janeiro", state: "RJ" },
    { id: "mock-savassi", name: "Belo Horizonte Savassi", city: "Belo Horizonte", state: "MG" },
    { id: "mock-batel", name: "Curitiba Batel", city: "Curitiba", state: "PR" },
    { id: "mock-barra", name: "Salvador Barra", city: "Salvador", state: "BA" },
];
