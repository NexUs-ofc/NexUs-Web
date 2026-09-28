import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import { useAuth } from "../../hooks/useAuth";
import "./dashboard-page.css";

export default function DashboardPage() {
    const { state, signOut } = useAuth();
    const navigate = useNavigate();
    const profile = state.profile;

    useEffect(() => {
        document.title = "Início — NexUs";
    }, []);

    function handleLogout(): void {
        signOut();
        navigate("/login", { replace: true });
    }

    return (
        <div className="page">
            <AppHeader userName={profile?.name ?? "Usuário"} onLogout={handleLogout} />
            <main className="dashboardMain">
                <h1 className="huninn">Visão geral</h1>
                {profile ? (
                    <section aria-label="Dados do perfil">
                        <p>
                            Olá, {profile.name} ({profile.email})
                        </p>
                        <p>
                            Tipo: {profile.profileType} — Status: {profile.profileStatus}
                        </p>
                        <Link to={`/perfil/${profile.id}`}>Ver meu perfil</Link>
                        {profile.phones.length > 0 ? (
                            <ul aria-label="Telefones">
                                {profile.phones.map((phone) => (
                                    <li key={phone}>{phone}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>Nenhum telefone cadastrado.</p>
                        )}
                    </section>
                ) : (
                    <p role="status">Carregando dados do perfil...</p>
                )}
            </main>
            <footer className="dashboardFooter">
                <span>NexUs — controle de filiais</span>
            </footer>
        </div>
    );
}
