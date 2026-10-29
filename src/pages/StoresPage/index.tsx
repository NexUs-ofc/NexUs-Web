import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PrimaryButton from "../../components/PrimaryButton";
import StoresFilters from "../../components/StoresFilters";
import StoresTable from "../../components/StoresTable";
import EditStoreModal from "../../components/EditStoreModal";
import DeleteStoreModal from "../../components/DeleteStoreModal";
import LoadingSpinner from "../../components/LoadingSpinner";
import ErrorAlert from "../../components/ErrorAlert";
import { useStores } from "../../hooks/useStores";
import { useStoresContext } from "../../hooks/useStoresContext";
import { useStoreDialogs } from "../../hooks/useStoreDialogs";
import "./stores-page.css";

export default function StoresPage() {
    const { stores, filters, locations, setSearch, setLocation } = useStores();
    const collection = useStoresContext();
    const modal = useStoreDialogs();
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Filiais Cadastradas — NexUs";
        document.getElementById("stores-title")?.focus();
    }, []);

    return (
        <main className="portal-page stores-page" aria-labelledby="stores-title">
            <header className="stores-page__heading">
                <div>
                    <h1 id="stores-title" tabIndex={-1}>Filiais Cadastradas</h1>
                    <p>Gerencie as informações das lojas vinculadas ao seu aplicativo.</p>
                </div>
                <PrimaryButton type="button" className="stores-page__new" onClick={() => { collection.clearFeedback(); navigate("/lojas/nova"); }}>
                    <img src={`${import.meta.env.BASE_URL}stores/plus.svg`} alt="" />
                    Nova Filial
                </PrimaryButton>
            </header>
            <StoresFilters
                filters={filters}
                locations={locations}
                onSearchChange={setSearch}
                onLocationChange={setLocation}
            />
            {collection.loading ? <LoadingSpinner message="Carregando filiais..." /> : (
                <StoresTable stores={stores} onEdit={modal.openEdit} onDelete={modal.openDelete} />
            )}
            {collection.error && modal.dialog.kind === "closed" ? (
                <div className="stores-page__feedback">
                    <ErrorAlert title="Não foi possível carregar as filiais" message={collection.error} />
                    <button type="button" onClick={collection.reload}>Tentar novamente</button>
                </div>
            ) : null}
            <footer className="stores-page__footer">
                <p role="status" aria-live="polite" aria-atomic="true">
                    {collection.success ? `${collection.success} ` : ""}
                    {!collection.loading ? (stores.length === 1 ? "1 filial encontrada." : `${stores.length} filiais encontradas.`) : ""}
                </p>
            </footer>
            {modal.dialog.kind === "edit" ? <EditStoreModal key={modal.dialog.store.id} store={modal.dialog.store} saving={modal.saving} error={modal.error} onSave={modal.save} onClose={modal.close} /> : null}
            {modal.dialog.kind === "delete" ? <DeleteStoreModal store={modal.dialog.store} saving={modal.saving} error={modal.error} onConfirm={modal.confirmDelete} onClose={modal.close} /> : null}
        </main>
    );
}
