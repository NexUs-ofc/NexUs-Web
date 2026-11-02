import PageTitle from "../../components/PageTitle";
import StoreForm from "../../components/StoreForm";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import PrimaryButton from "../../components/PrimaryButton";
import "../../../styles/pages/EditStorePage/edit-store-page.css";
import { Link } from "react-router-dom";
import { useEditStorePage } from "../../hooks/useEditStorePage";

export default function EditStorePage() {
    const { details, collection, error, route, initialData, save, back } = useEditStorePage();
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
                : details.store && initialData ? <StoreForm key={details.store.id} mode="edit" initialData={initialData}
                    saving={collection.saving} error={collection.error}
                    onSave={save}
                    onSaved={back} onCancel={back} /> : null}
            {error || details.loading ? <footer className="edit-store-page__actions">
                <Link to="/lojas">Voltar para filiais</Link>
                {!route.error && details.error ? <PrimaryButton type="button" onClick={details.reload}>Tentar novamente</PrimaryButton> : null}
            </footer> : null}
        </main>
    );
}
