import type { ChartTable } from "../../types/dashboardChart";

export interface DashboardDataTableProps { title: string; table: ChartTable; }

export default function DashboardDataTable({ title, table }: DashboardDataTableProps) {
    return (
        <div className="dashboard-data-table" tabIndex={0} role="region" aria-label={`Dados: ${title}`}>
            <table>
                <caption>{title}</caption>
                <thead><tr>{table.columns.map((column) => <th key={column.id} scope="col">{column.label}</th>)}</tr></thead>
                <tbody>
                    {table.rows.map((row) => (
                        <tr key={row.id}>
                            {table.columns.map((column, columnIndex) => columnIndex === 0 ? (
                                <th key={column.id} scope="row">{row.cells[columnIndex]}</th>
                            ) : <td key={column.id}>{row.cells[columnIndex]}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
