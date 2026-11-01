import type { PostalAddress } from "../types/address";
import { BRAZILIAN_STATES, STORE_MAX_LENGTH } from "./validateStore";

export function validateCep(value: string): string {
    if (!/^\d{5}-?\d{3}$/u.test(value)) throw new Error("Informe um CEP válido com 8 dígitos.");
    return value.replace("-", "");
}

export function parsePostalAddress(value: unknown, requestedCep: string): PostalAddress {
    if (typeof value !== "object" || value === null || Array.isArray(value)) throw new Error("O ViaCEP retornou um endereço inválido. Tente novamente.");
    const data = value as Record<string, unknown>;
    if (data.erro === true || data.erro === "true") throw new Error("CEP não encontrado. Verifique os números informados.");
    function text(field: string, maxLength: number): string {
        const content = data[field];
        if (typeof content !== "string" || content.length > maxLength) throw new Error("O ViaCEP retornou um endereço inválido. Tente novamente.");
        return content.replace(/\p{Cc}/gu, "").trim();
    }
    const address: PostalAddress = {
        cep: validateCep(text("cep", STORE_MAX_LENGTH.cep)),
        street: text("logradouro", STORE_MAX_LENGTH.street),
        neighborhood: text("bairro", STORE_MAX_LENGTH.neighborhood),
        city: text("localidade", STORE_MAX_LENGTH.city),
        state: text("uf", STORE_MAX_LENGTH.state).toUpperCase(),
    };
    if (address.cep !== validateCep(requestedCep) || !address.city || !BRAZILIAN_STATES.includes(address.state)) throw new Error("O ViaCEP retornou um endereço incompatível com o CEP informado. Tente novamente.");
    if (!address.street || !address.neighborhood) throw new Error("O CEP informado não possui endereço completo. Insira um CEP válido com rua e bairro.");
    return address;
}
