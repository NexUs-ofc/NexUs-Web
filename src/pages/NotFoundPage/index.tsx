import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./not-found-page.css";

export default function NotFoundPage() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Página não encontrada — NexUs";
    }, []);

    function handleGoBack(): void {
        navigate("/", { replace: true });
    }

    return (
        <div className="page">
            <main className="notFoundMain">
                <h1>Página não encontrada</h1>
                <p>O endereço acessado não existe ou foi movido.</p>
                <div className="notFoundActions">
                    <button type="button" className="primary-button huninn" onClick={handleGoBack}>
                        Voltar ao início
                    </button>
                    <Link to="/login">Ir para o login</Link>
                </div>
            </main>
        </div>
    );
}
