import { useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import StoreForm from "../../components/StoreForm";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import PrimaryButton from "../../components/PrimaryButton";
import { useStoresContext } from "../../hooks/useStoresContext";
import { useStoreDetails } from "../../hooks/useStoreDetails";
import { resolveStoreRouteId } from "../../utils/storeRoute";
import { toStoreForm } from "../../utils/validateStore";
import "../../../styles/pages/EditStorePage/edit-store-page.css";

export default function EditStorePage() {
    const { id: routeId } = useParams<{ id: string }>();
    const route = resolveStoreRouteId(routeId);
    const collection = useStoresContext();
    const summary = collection.stores.find((store) => store.id === route.id);
    const details = useStoreDetails(route.id, summary);
    const navigate = useNavigate();
    const { clearFeedback } = collection;

    useEffect(() => {
        document.title = "Editar Filial — NexUs";
        clearFeedback();
    }, [route.id, clearFeedback]);

    const error = route.error || details.error;
    return (
        <main className="portal-page edit-store-page" aria-labelledby="edit-store-title">
            <header className="edit-store-page__header">
                <nav className="edit-store-page__breadcrumbs" aria-label="Caminho da página">
                    <Link to="/lojas">Filiais</Link><span aria-hidden="true"> / </span><span aria-current="page">Editar filial</span>
                </nav>
                <PageTitle id="edit-store-title">Editar Filial</PageTitle>
                <p>Atualize as informações da filial.</p>
            </header>
            {error ? <ErrorAlert title="Não foi possível abrir a filial" message={error} />
                : details.loading ? <LoadingSpinner message="Carregando dados da filial..." />
                : details.store ? <StoreForm key={details.store.id} mode="edit" initialData={toStoreForm(details.store)}
                    saving={collection.saving} error={collection.error}
                    onSave={(data) => route.id === undefined ? Promise.resolve(false) : collection.editStore(route.id, data)}
                    onSaved={() => navigate("/lojas")} onCancel={() => navigate("/lojas")} /> : null}
            {error || details.loading ? <footer className="edit-store-page__actions">
                <Link to="/lojas">Voltar para filiais</Link>
                {!route.error && details.error ? <PrimaryButton type="button" onClick={details.reload}>Tentar novamente</PrimaryButton> : null}
            </footer> : null}
        </main>
    );
}
