import { lazy, memo, Suspense, useId, useState } from "react";
import type { DashboardChartModel } from "../../types/dashboardChart";
import LoadingSpinner from "../LoadingSpinner";
import DashboardChartLegend from "../DashboardChartLegend";
import DashboardDataTable from "../DashboardDataTable";

export interface DashboardChartCardProps { model: DashboardChartModel; mapSource?: string; }

const DashboardChart = lazy(() => import("../DashboardChart"));

function DashboardChartCard({ model, mapSource }: DashboardChartCardProps) {
    const [showData, setShowData] = useState(false);
    const id = useId();
    return (
        <article className={`dashboard-card dashboard-card--${model.id}${model.fullWidth ? " dashboard-card--full" : ""}`} aria-labelledby={`${id}-title`}>
            <header className="dashboard-card__heading">
                <h2 id={`${id}-title`}>{model.title}</h2>
                <p>{model.description}</p>
            </header>
            <div className="dashboard-card__visual" hidden={showData} role="region" aria-label={`Gráfico: ${model.title}`} tabIndex={0}>
                {model.empty ? <p className="dashboard-card__empty">Sem dados para este gráfico.</p> : (
                    <Suspense fallback={<LoadingSpinner message="Carregando gráfico..." />}>
                        <DashboardChart title={model.title} option={model.option} mapSource={mapSource} />
                    </Suspense>
                )}
            </div>
            <div id={`${id}-data`} hidden={!showData}>
                {showData ? <DashboardDataTable title={model.title} table={model.table} /> : null}
            </div>
            <footer className="dashboard-card__footer">
                <DashboardChartLegend items={model.legend} />
                <div className="dashboard-card__axes">
                    {model.axisNotes.map((note) => <p key={note.id}>{note.text}</p>)}
                </div>
                {model.note ? <p className="dashboard-card__note">{model.note}</p> : null}
                <button type="button" className="dashboard-card__data-toggle" aria-expanded={showData} aria-controls={`${id}-data`} onClick={() => setShowData((previous) => !previous)}>
                    {showData ? "Ver gráfico" : "Ver dados"}<span className="dashboard-sr-only"> de {model.title}</span>
                </button>
            </footer>
        </article>
    );
}

export default memo(DashboardChartCard);
