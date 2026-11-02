import PageFooter from "../../components/PageFooter";
import { Link } from "react-router-dom";
import PageTitle from "../../components/PageTitle";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/pages/NotFoundPage/not-found-page.css";

export default function NotFoundPage() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Página não encontrada — NexUs";
    }, []);

    function handleGoBack(): void {
        navigate("/login", { replace: true });
    }

    return (
        <div className="page">
            <main className="notFoundMain">
                <PageTitle>Página não encontrada</PageTitle>
                <p>O endereço acessado não existe ou foi movido.</p>
                <nav className="notFoundActions" aria-label="Retornar ao portal">
                    <button type="button" className="primary-button huninn" onClick={handleGoBack}>
                        Voltar ao login
                    </button>
                </nav>
                <Link to="/">Página inicial</Link>
            </main>
            <PageFooter />
        </div>
    );
}
