import { MdOutlineDescription } from "react-icons/md";
import type { ReportItem, ReportPdfAction } from "../../types/report";
import { formatReportDate } from "../../utils/reportFilters";
import ReportActions from "../ReportActions";

export interface ReportRowProps {
    report: ReportItem;
    monthTitle: string;
    pendingAction: ReportPdfAction | null;
    busy: boolean;
    onView: (report: ReportItem) => void;
    onDownload: (report: ReportItem) => void;
}

export default function ReportRow({ report, monthTitle, pendingAction, busy, onView, onDownload }: ReportRowProps) {
    const date = formatReportDate(report.date);
    return (
        <tr aria-busy={pendingAction !== null}>
            <th scope="row" className="reports-table__name">
                <span className="reports-table__icon" aria-hidden="true"><MdOutlineDescription /></span>
                <span>{report.title}{report.status === "rascunho" ? <em className="reports-table__draft"> (rascunho)</em> : null}</span>
            </th>
            <td><time dateTime={report.date}>{date}</time></td>
            <td>{report.type}</td>
            <td className="reports-table__actions">
                <ReportActions
                    report={report}
                    description={`${report.title}, ${monthTitle}, de ${date}`}
                    pendingAction={pendingAction}
                    busy={busy}
                    onView={onView}
                    onDownload={onDownload}
                />
            </td>
        </tr>
    );
}
