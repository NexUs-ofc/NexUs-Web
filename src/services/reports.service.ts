import type { ReportItem, ReportPdfSource, ReportsList } from "../types/report";
import { toValidatedReports } from "../utils/validateReports";
import { describeReportsError, reportsRequest, reportsRequestBlob } from "./reportsClient";

export interface ReportRequestOptions { signal?: AbortSignal; }

function requestOptions(options: ReportRequestOptions): ReportRequestOptions {
    return options.signal ? { signal: options.signal } : {};
}

function pdfPath(report: Pick<ReportItem, "year" | "month">): string {
    return `/reports/${report.year}/${report.month}`;
}

export function reportFilename(report: Pick<ReportItem, "year" | "month">): string {
    return `nexus-bi-${report.year}-${String(report.month).padStart(2, "0")}.pdf`;
}

function assertPdf(blob: Blob): Blob {
    if (blob.size === 0 || (blob.type !== "" && !blob.type.includes("pdf"))) {
        throw new Error("O arquivo recebido não é um PDF válido.");
    }
    return blob;
}

// Sem filtro de período: a API devolve TODOS os PDFs do bucket, agrupados por mês; ano, mês e nome são filtrados na tela.
export async function listReports(options: ReportRequestOptions = {}): Promise<ReportsList> {
    try {
        const data = await reportsRequest<unknown>("/reports", requestOptions(options));
        return toValidatedReports(data);
    } catch (error) {
        if (options.signal?.aborted) throw error;
        throw new Error(describeReportsError(error, "Não foi possível carregar os relatórios. Tente novamente."), { cause: error });
    }
}

/**
 * Para visualizar: baixa o PDF pela API (que lê do bucket do Supabase) e o exibe como blob.
 * O link assinado do Supabase não serve para o <iframe>: o Storage responde com `sandbox` na política de
 * conteúdo e o navegador bloqueia o PDF (ícone de rosto triste). O blob é do próprio site, então abre normal.
 */
export async function getReportPdfSource(report: ReportItem, options: ReportRequestOptions = {}): Promise<ReportPdfSource> {
    try {
        return { kind: "blob", blob: assertPdf(await reportsRequestBlob(`${pdfPath(report)}/pdf`, requestOptions(options))) };
    } catch (error) {
        if (options.signal?.aborted) throw error;
        throw new Error(describeReportsError(error, "Não foi possível abrir o relatório. Tente novamente."), { cause: error });
    }
}

export async function downloadReportPdf(report: ReportItem, options: ReportRequestOptions = {}): Promise<Blob> {
    try {
        return assertPdf(await reportsRequestBlob(`${pdfPath(report)}/pdf?download=true`, requestOptions(options)));
    } catch (error) {
        if (options.signal?.aborted) throw error;
        throw new Error(describeReportsError(error, "Não foi possível baixar o relatório. Tente novamente."), { cause: error });
    }
}
