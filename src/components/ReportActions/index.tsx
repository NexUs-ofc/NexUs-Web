import { MdOutlineFileDownload, MdOutlineVisibility } from "react-icons/md";
import type GenericComponentProps from "../../types/common";
import type { ReportItem, ReportPdfAction } from "../../types/report";
import "../../../styles/components/ReportActions/report-actions.css";

export interface ReportActionsProps extends GenericComponentProps {
    report: ReportItem;
    /** Texto que identifica o relatório para leitores de tela (título, mês e data). */
    description: string;
    /** Ação em andamento para ESTE relatório, se houver. */
    pendingAction: ReportPdfAction | null;
    /** Alguma operação de PDF está em andamento (em qualquer relatório). */
    busy: boolean;
    onView: (report: ReportItem) => void;
    onDownload: (report: ReportItem) => void;
}

// aria-disabled (e não `disabled`) mantém o foco no botão durante o carregamento: o foco precisa estar nele
// para voltar ao mesmo lugar quando o diálogo de visualização fechar.
export default function ReportActions({ report, description, pendingAction, busy, onView, onDownload, className = "", id }: ReportActionsProps) {
    return (
        <div className={`report-actions ${className}`} id={id}>
            <button
                type="button"
                className="report-actions__view"
                aria-disabled={busy}
                aria-label={`Visualizar ${description}`}
                onClick={() => { if (!busy) onView(report); }}
            >
                <MdOutlineVisibility aria-hidden="true" />
                <span>{pendingAction === "view" ? "Abrindo..." : "Visualizar"}</span>
            </button>
            <button
                type="button"
                className="report-actions__download"
                aria-disabled={busy}
                aria-label={pendingAction === "download" ? `Baixando ${description}` : `Baixar PDF de ${description}`}
                onClick={() => { if (!busy) onDownload(report); }}
            >
                <MdOutlineFileDownload aria-hidden="true" />
            </button>
        </div>
    );
}
