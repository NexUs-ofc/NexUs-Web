import type { ReportItem, ReportMonthGroup, ReportStatus, ReportsList } from "../types/report";
import { asList, asNumber, asRecord, asText } from "./responseParsers";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/u;

function asStatus(value: unknown): ReportStatus {
    if (value === "publicado" || value === "rascunho") return value;
    throw new Error("Situação do relatório inválida.");
}

function asIsoDate(value: unknown): string {
    const date = asText(value, 10);
    if (!ISO_DATE.test(date) || Number.isNaN(Date.parse(date))) throw new Error("Data do relatório inválida.");
    return date;
}

function asPeriod(value: unknown, min: number, max: number): number {
    const period = asNumber(value, max);
    if (!Number.isInteger(period) || period < min) throw new Error("Período do relatório inválido.");
    return period;
}

// Converte a resposta de GET /reports (chaves em português) para o domínio do site, validando cada campo.
export function toValidatedReports(value: unknown): ReportsList {
    const root = asRecord(value);
    const groups = asList<ReportMonthGroup>(root["meses"], (group) => {
        const year = asPeriod(group["ano"], 2020, 2100);
        const month = asPeriod(group["mes"], 1, 12);
        const reports = asList<ReportItem>(group["relatorios"], (item) => ({
            id: asText(item["id"], 20),
            year,
            month,
            title: asText(item["titulo"], 160),
            date: asIsoDate(item["data"]),
            type: asText(item["tipo"], 40),
            status: asStatus(item["status"]),
            generatedWithAi: item["geradoComIa"] === true,
        }));
        return { id: asText(group["id"], 20), year, month, title: asText(group["titulo"], 40), reports };
    });
    return { groups };
}

/** Aceita só links http(s): um PDF assinado nunca deve virar `javascript:` ou `data:` na interface. */
export function toSafeHttpUrl(value: unknown): string {
    const raw = asText(value, 4000);
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Link do relatório inválido.");
    return url.toString();
}
