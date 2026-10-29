import { useEffect } from "react";
import DashboardSummary from "../../components/DashboardSummary";
import DashboardChartsGrid from "../../components/DashboardChartsGrid";
import ErrorAlert from "../../components/ErrorAlert";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useDashboard } from "../../hooks/useDashboard";
import { useDashboardCharts } from "../../hooks/useDashboardCharts";
import "../../../styles/dashboard.css";

export default function DashboardPage() {
    const { data, mapSource, companyName, loading, error, reload } = useDashboard();
    const charts = useDashboardCharts(data);

    useEffect(() => {
        document.title = "Dashboard — NexUs";
        document.getElementById("dashboard-title")?.focus();
    }, []);

    function handleRetry(): void {
        // Mantém o contexto de teclado antes de o botão de erro sair do DOM.
        document.getElementById("dashboard-title")?.focus();
        reload();
    }

    return (
        <main id="dashboard-main" className="portal-page dashboard-page" aria-labelledby="dashboard-title" tabIndex={0} aria-busy={loading}>
            <header className="dashboard-page__heading">
                <h1 id="dashboard-title" tabIndex={-1}>Bem-vindo{companyName ? `, ${companyName}` : ""}</h1>
            </header>
            <div className="dashboard-page__content">
                {loading ? <LoadingSpinner message="Carregando indicadores e gráficos..." /> : null}
                {error ? (
                    <div className="dashboard-page__error">
                        <ErrorAlert title="Dashboard indisponível" message={error} />
                        <button type="button" onClick={handleRetry}>Tentar novamente</button>
                    </div>
                ) : null}
                {!loading && !error && data && mapSource ? (
                    <>
                        <DashboardSummary summary={data.summary} />
                        <DashboardChartsGrid charts={charts} mapSource={mapSource} />
                    </>
                ) : null}
                <footer className="dashboard-page__footer">
                    <p role="status" aria-live="polite" aria-atomic="true">{!loading && !error && data ? "Dashboard carregado com sucesso. Dados demonstrativos." : ""}</p>
                </footer>
            </div>
        </main>
    );
}
