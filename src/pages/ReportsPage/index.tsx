import { useEffect } from "react";
import ErrorAlert from "../../components/ErrorAlert";
import LoadingSpinner from "../../components/LoadingSpinner";
import PageTitle from "../../components/PageTitle";
import ReportPdfDialog from "../../components/ReportPdfDialog";
import ReportsFilters from "../../components/ReportsFilters";
import ReportsMonthSection from "../../components/ReportsMonthSection";
import { useReportsPage } from "../../hooks/useReportsPage";
import { REPORT_MONTH_OPTIONS } from "../../utils/reportFilters";
import "../../../styles/pages/ReportsPage/reports-page.css";

export default function ReportsPage() {
    const { filtersState, pdf, pdfState, groups, years, total, hasAnyReport, loading, error, reload } = useReportsPage();
    const { filters, setSearch, setYear, setMonth } = filtersState;

    useEffect(() => {
        document.title = "Relatórios — NexUs";
    }, []);

    const ready = !loading && error === "";
    const notice = pdfState.phase === "idle" ? pdfState.notice : "";

    return (
        <main id="reports-main" className="portal-page reports-page" aria-labelledby="reports-title" aria-busy={loading}>
            <header className="reports-page__heading">
                <PageTitle id="reports-title">Relatórios das filiais</PageTitle>
                <p>Acompanhe indicadores, compare unidades e exporte análises da sua operação.</p>
            </header>

            <ReportsFilters
                filters={filters}
                years={years}
                months={REPORT_MONTH_OPTIONS}
                onSearchChange={setSearch}
                onYearChange={setYear}
                onMonthChange={setMonth}
            />

            <div className="reports-page__content">
                {loading ? <LoadingSpinner message="Carregando relatórios..." /> : null}
                {error !== "" ? (
                    <div className="reports-page__error">
                        <ErrorAlert title="Relatórios indisponíveis" message={error} />
                        <button type="button" onClick={reload}>Tentar novamente</button>
                    </div>
                ) : null}
                {pdfState.phase === "error" ? (
                    <div className="reports-page__error">
                        <ErrorAlert title="Não foi possível concluir a ação" message={pdfState.message} />
                        <button type="button" onClick={pdf.dismissError}>Fechar aviso</button>
                    </div>
                ) : null}
                {ready && groups.length === 0 ? (
                    <p className="reports-page__empty" role="status">
                        {hasAnyReport ? "Nenhum relatório encontrado para os filtros aplicados." : "Ainda não há relatórios disponíveis."}
                    </p>
                ) : null}
                {ready ? groups.map((group) => (
                    <ReportsMonthSection key={group.id} group={group} pdfState={pdfState} onView={pdf.view} onDownload={pdf.download} />
                )) : null}
            </div>

            {pdfState.phase === "viewing" ? <ReportPdfDialog report={pdfState.report} url={pdfState.url} onClose={pdf.closeViewer} /> : null}

            <footer className="reports-page__footer">
                <p role="status" aria-live="polite" aria-atomic="true">
                    {pdfState.phase === "loading" ? (pdfState.action === "view" ? "Abrindo o relatório..." : "Preparando o download...") : notice}
                    {ready && notice === "" && pdfState.phase !== "loading" ? `${total} ${total === 1 ? "relatório exibido" : "relatórios exibidos"}.` : ""}
                </p>
            </footer>
        </main>
    );
}
