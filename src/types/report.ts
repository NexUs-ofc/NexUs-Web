export type ReportStatus = "publicado" | "rascunho";

export interface ReportItem {
    /** Identificador único, no formato "2026-09". */
    id: string;
    year: number;
    month: number;
    title: string;
    /** Data de referência, ISO "AAAA-MM-DD". */
    date: string;
    type: string;
    status: ReportStatus;
    generatedWithAi: boolean;
}

export interface ReportMonthGroup {
    id: string;
    year: number;
    month: number;
    title: string;
    reports: ReadonlyArray<ReportItem>;
}

export interface ReportsList {
    groups: ReadonlyArray<ReportMonthGroup>;
}

export interface ReportFilters {
    search: string;
    /** Vazio = todos os anos. */
    year: string;
    /** "1" a "12"; vazio = todos os meses. */
    month: string;
}

export interface ReportPeriodOption {
    value: number;
    label: string;
}

/** PDF pronto para abrir: link assinado do bucket ou o arquivo baixado pela API. */
export type ReportPdfSource =
    | { kind: "remote"; url: string }
    | { kind: "blob"; blob: Blob };

export type ReportPdfAction = "view" | "download";

export type ReportPdfState =
    | { phase: "idle"; notice: string }
    | { phase: "loading"; reportId: string; action: ReportPdfAction }
    | { phase: "viewing"; report: ReportItem; url: string }
    | { phase: "error"; message: string };

export type ReportPdfEvent =
    | { type: "START"; reportId: string; action: ReportPdfAction }
    | { type: "VIEW_READY"; report: ReportItem; url: string }
    | { type: "DOWNLOAD_DONE"; title: string }
    | { type: "FAILED"; message: string }
    | { type: "CLOSE" }
    | { type: "DISMISS" };
