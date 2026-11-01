import { useChartView } from "../../hooks/useChartView";
import { lazy, memo, Suspense, useId } from "react";
import type { DashboardChartModel } from "../../types/dashboardChart";
import LoadingSpinner from "../LoadingSpinner";
import DashboardChartLegend from "../DashboardChartLegend";
import DashboardDataTable from "../DashboardDataTable";

export interface DashboardChartCardProps { model: DashboardChartModel; mapSource?: string; }

const DashboardChart = lazy(() => import("../DashboardChart"));

function DashboardChartCard({ model, mapSource }: DashboardChartCardProps) {
    const { showData, tabs, select, onKeyDown } = useChartView();
    const id = useId();
    return (
        <article className={`dashboard-card dashboard-card--${model.id}${model.fullWidth ? " dashboard-card--full" : ""}`} aria-labelledby={`${id}-title`}>
            <header className="dashboard-card__heading">
                <h2 id={`${id}-title`}>{model.title}</h2>
                <p>{model.description}</p>
            </header>
            <div role="tablist" aria-label={`Visualização de ${model.title}`} className="dashboard-card__tabs" onKeyDown={onKeyDown}>
                {["Gráfico", "Dados"].map((label, index) => <button key={label} type="button" role="tab" id={`${id}-tab-${index}`}
                    ref={(element) => { tabs.current[index] = element; }} aria-selected={Number(showData) === index}
                    aria-controls={`${id}-panel-${index}`} tabIndex={Number(showData) === index ? 0 : -1}
                    className="dashboard-card__data-toggle" onClick={() => select(index)}>{label}</button>)}
            </div>
            <div id={`${id}-panel-0`} className="dashboard-card__visual" hidden={showData} role="tabpanel" aria-labelledby={`${id}-tab-0`} tabIndex={0}>
                {model.empty ? <p className="dashboard-card__empty">Sem dados para este gráfico.</p> : (
                    <Suspense fallback={<LoadingSpinner message="Carregando gráfico..." />}>
                        <DashboardChart title={model.title} option={model.option} mapSource={mapSource} />
                    </Suspense>
                )}
            </div>
            <div id={`${id}-panel-1`} hidden={!showData} role="tabpanel" aria-labelledby={`${id}-tab-1`} tabIndex={0}>
                {showData ? <DashboardDataTable title={model.title} table={model.table} /> : null}
            </div>
            <footer className="dashboard-card__footer">
                <DashboardChartLegend items={model.legend} />
                <div className="dashboard-card__axes">
                    {model.axisNotes.map((note) => <p key={note.id}>{note.text}</p>)}
                </div>
                {model.note ? <p className="dashboard-card__note">{model.note}</p> : null}

            </footer>
        </article>
    );
}

export default memo(DashboardChartCard);
