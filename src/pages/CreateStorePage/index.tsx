import PageTitle from "../../components/PageTitle";
import StoreForm from "../../components/StoreForm";
import LoadingSpinner from "../../components/LoadingSpinner";
import "../../../styles/pages/CreateStorePage/create-store-page.css";
import { Link } from "react-router-dom";
import { EMPTY_STORE_FORM } from "../../utils/validateStore";
import { useCreateStorePage } from "../../hooks/useCreateStorePage";

export default function CreateStorePage() {
    const { addStore, saving, loading, error, back } = useCreateStorePage();
    return (
        <main className="portal-page create-store-page" aria-labelledby="create-store-title">
            <header className="create-store-page__header">
                <nav className="create-store-page__breadcrumbs" aria-label="Caminho da página">
                    <Link to="/lojas">Filiais</Link>
                    <img src={`${import.meta.env.BASE_URL}stores/chevron-right.svg`} alt="" />
                    <span aria-current="page">Nova Filial</span>
                </nav>
                <PageTitle id="create-store-title">Adicionar Nova Filial</PageTitle>
                <p>Preencha os campos abaixo para cadastrar um novo ponto comercial no aplicativo.</p>
            </header>
            {loading ? <LoadingSpinner message="Carregando filiais..." /> : <StoreForm mode="create" initialData={EMPTY_STORE_FORM} saving={saving} error={error} onSave={addStore} onSaved={back} onCancel={back} />}
        </main>
    );
}
