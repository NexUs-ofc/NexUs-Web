import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import StoreForm from "../../components/StoreForm";
import { useStoresContext } from "../../hooks/useStoresContext";
import { EMPTY_STORE_FORM } from "../../utils/validateStore";
import "./create-store-page.css";

export default function CreateStorePage() {
    const { addStore, saving, error } = useStoresContext();
    const navigate = useNavigate();
    useEffect(() => {
        document.title = "Adicionar Nova Filial — NexUs";
        document.getElementById("create-store-title")?.focus();
    }, []);

    return (
        <main className="portal-page create-store-page" aria-labelledby="create-store-title">
            <header className="create-store-page__header">
                <nav className="create-store-page__breadcrumbs" aria-label="Caminho da página">
                    <Link to="/lojas">Filiais</Link>
                    <img src={`${import.meta.env.BASE_URL}stores/chevron-right.svg`} alt="" />
                    <span aria-current="page">Nova Filial</span>
                </nav>
                <h1 id="create-store-title" tabIndex={-1}>Adicionar Nova Filial</h1>
                <p>Preencha os campos abaixo para cadastrar um novo ponto comercial no aplicativo.</p>
            </header>
            <StoreForm mode="create" initialData={EMPTY_STORE_FORM} saving={saving} error={error} onSave={addStore} onSaved={() => navigate("/lojas")} onCancel={() => navigate("/lojas")} />
        </main>
    );
}
