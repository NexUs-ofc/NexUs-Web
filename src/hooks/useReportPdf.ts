import { useCallback, useEffect, useReducer, useRef } from "react";
import { downloadReportPdf, getReportPdfSource, reportFilename } from "../services/reports.service";
import type { ReportItem, ReportPdfEvent, ReportPdfState } from "../types/report";
import { saveBlobAsFile } from "../utils/fileDownload";

export const initialReportPdfState: ReportPdfState = { phase: "idle", notice: "" };

// useReducer porque o fluxo tem fases excludentes (ocioso, carregando, visualizando, erro) com dados
// diferentes em cada uma; vários useState permitiriam combinações impossíveis (ex.: carregando e com erro).
export function reportPdfReducer(state: ReportPdfState, event: ReportPdfEvent): ReportPdfState {
    switch (event.type) {
        case "START":
            return { phase: "loading", reportId: event.reportId, action: event.action };
        case "VIEW_READY":
            return state.phase === "loading" ? { phase: "viewing", report: event.report, url: event.url } : state;
        case "DOWNLOAD_DONE":
            return { phase: "idle", notice: `Download de "${event.title}" iniciado.` };
        case "FAILED":
            return { phase: "error", message: event.message };
        case "CLOSE":
        case "DISMISS":
            return initialReportPdfState;
        default:
            return state;
    }
}

export interface UseReportPdfResult {
    state: ReportPdfState;
    view: (report: ReportItem) => void;
    download: (report: ReportItem) => void;
    closeViewer: () => void;
    dismissError: () => void;
}

export function useReportPdf(): UseReportPdfResult {
    const [state, dispatch] = useReducer(reportPdfReducer, initialReportPdfState);
    const controllerRef = useRef<AbortController | null>(null);
    const blobUrlRef = useRef<string | null>(null);

    const releaseBlobUrl = useCallback((): void => {
        if (blobUrlRef.current !== null) {
            URL.revokeObjectURL(blobUrlRef.current);
            blobUrlRef.current = null;
        }
    }, []);

    const begin = useCallback((report: ReportItem, action: "view" | "download"): AbortSignal => {
        controllerRef.current?.abort();
        releaseBlobUrl();
        const controller = new AbortController();
        controllerRef.current = controller;
        dispatch({ type: "START", reportId: report.id, action });
        return controller.signal;
    }, [releaseBlobUrl]);

    const fail = useCallback((error: unknown, signal: AbortSignal): void => {
        if (!signal.aborted) dispatch({ type: "FAILED", message: error instanceof Error ? error.message : "Não foi possível concluir a operação." });
    }, []);

    const view = useCallback((report: ReportItem): void => {
        const signal = begin(report, "view");
        getReportPdfSource(report, { signal }).then((source) => {
            if (signal.aborted) return;
            if (source.kind === "blob") {
                blobUrlRef.current = URL.createObjectURL(source.blob);
                dispatch({ type: "VIEW_READY", report, url: blobUrlRef.current });
            } else {
                dispatch({ type: "VIEW_READY", report, url: source.url });
            }
        }).catch((error: unknown) => fail(error, signal));
    }, [begin, fail]);

    const download = useCallback((report: ReportItem): void => {
        const signal = begin(report, "download");
        downloadReportPdf(report, { signal }).then((blob) => {
            if (signal.aborted) return;
            saveBlobAsFile(blob, reportFilename(report));
            dispatch({ type: "DOWNLOAD_DONE", title: `${report.title} (${String(report.month).padStart(2, "0")}/${report.year})` });
        }).catch((error: unknown) => fail(error, signal));
    }, [begin, fail]);

    const closeViewer = useCallback((): void => {
        controllerRef.current?.abort();
        releaseBlobUrl();
        dispatch({ type: "CLOSE" });
    }, [releaseBlobUrl]);

    const dismissError = useCallback((): void => dispatch({ type: "DISMISS" }), []);

    useEffect(() => () => {
        controllerRef.current?.abort();
        releaseBlobUrl();
    }, [releaseBlobUrl]);

    return { state, view, download, closeViewer, dismissError };
}
