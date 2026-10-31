import { useId } from "react";
import type GenericComponentProps from "../../types/common";
import type { ReportItem } from "../../types/report";
import { useDialog } from "../../hooks/useDialog";
import { formatReportDate } from "../../utils/reportFilters";
import "../../../styles/components/ReportPdfDialog/report-pdf-dialog.css";

export interface ReportPdfDialogProps extends GenericComponentProps {
    report: ReportItem;
    url: string;
    onClose: () => void;
}

// useDialog abre como modal, leva o foco ao botão Fechar, prende o Tab dentro do diálogo e, ao fechar,
// devolve o foco ao botão "Visualizar" que o abriu (ou ao título da página se ele não existir mais).
export default function ReportPdfDialog({ report, url, onClose, className = "", id }: ReportPdfDialogProps) {
    const titleId = useId();
    const dialogRef = useDialog("reports-title");
    const description = `${report.title} — ${String(report.month).padStart(2, "0")}/${report.year}`;

    return (
        <dialog
            ref={dialogRef}
            id={id}
            className={`report-dialog ${className}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onCancel={(event) => { event.preventDefault(); onClose(); }}
        >
            <header className="report-dialog__header">
                <div>
                    <h2 id={titleId}>{report.title}</h2>
                    <p>Referência: {formatReportDate(report.date)} · {report.type}</p>
                </div>
                <button type="button" className="report-dialog__close" data-initial-focus onClick={onClose}>Fechar</button>
            </header>
            <iframe className="report-dialog__viewer" title={`Relatório: ${description}`} src={url} referrerPolicy="no-referrer" />
        </dialog>
    );
}
