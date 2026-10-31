import { memo, useId } from "react";
import type GenericComponentProps from "../../types/common";
import type { ReportItem, ReportMonthGroup, ReportPdfState } from "../../types/report";
import { formatReportCount } from "../../utils/reportFilters";
import ReportRow from "../ReportRow";
import "../../../styles/components/ReportsMonthSection/reports-month-section.css";

export interface ReportsMonthSectionProps extends GenericComponentProps {
    group: ReportMonthGroup;
    pdfState: ReportPdfState;
    onView: (report: ReportItem) => void;
    onDownload: (report: ReportItem) => void;
}

function ReportsMonthSection({ group, pdfState, onView, onDownload, className = "", id }: ReportsMonthSectionProps) {
    const headingId = useId();
    const busy = pdfState.phase === "loading";

    return (
        <section className={`reports-month ${className}`} id={id} aria-labelledby={headingId}>
            <header className="reports-month__header">
                <h2 id={headingId}>{group.title}</h2>
                <p>{formatReportCount(group.reports.length)}</p>
            </header>
            <div className="reports-table" role="region" aria-labelledby={headingId} tabIndex={0}>
                <table>
                    <caption className="reports-table__caption">Relatórios de {group.title}</caption>
                    <thead>
                        <tr>
                            <th scope="col">Relatório</th>
                            <th scope="col">Data</th>
                            <th scope="col">Tipo</th>
                            <th scope="col" className="reports-table__actions">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {group.reports.map((report) => (
                            <ReportRow
                                key={report.id}
                                report={report}
                                monthTitle={group.title}
                                pendingAction={pdfState.phase === "loading" && pdfState.reportId === report.id ? pdfState.action : null}
                                busy={busy}
                                onView={onView}
                                onDownload={onDownload}
                            />
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export default memo(ReportsMonthSection);
