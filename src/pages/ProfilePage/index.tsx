import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import { useAuth } from "../../hooks/useAuth";
import "./profile-page.css";

export default function ProfilePage() {
    const { userId } = useParams<{ userId: string }>();
    const { state, signOut } = useAuth();
    const profile = state.profile;

    useEffect(() => {
        document.title = "Meu perfil — NexUs";
    }, []);

    if (userId === undefined || userId === "") {
        return (
            <div className="page">
                <main className="profileMain">
                    <h1>Perfil não informado</h1>
                    <p role="alert">Nenhum identificador de perfil foi informado na rota.</p>
                    <Link to="/">Voltar ao início</Link>
                </main>
            </div>
        );
    }

    const isOwnProfile = profile !== null && String(profile.id) === userId;

    return (
        <div className="page">
            <AppHeader userName={profile?.name ?? "Usuário"} onLogout={signOut} />
            <main className="profileMain">
                <h1>Perfil {userId}</h1>
                {profile && isOwnProfile ? (
                    <section aria-label="Detalhes do perfil">
                        <p>
                            {profile.name} — {profile.email}
                        </p>
                        <address>
                            {profile.address.street}, {profile.address.number} —{" "}
                            {profile.address.neighborhood}, {profile.address.city}/
                            {profile.address.state} — CEP {profile.address.cep}
                        </address>
                        <ul aria-label="Telefones do perfil">
                            {profile.phones.map((phone) => (
                                <li key={phone}>{phone}</li>
                            ))}
                        </ul>
                    </section>
                ) : (
                    <p role="status">Este perfil não corresponde à sessão atual.</p>
                )}
                <Link to="/">Voltar ao início</Link>
            </main>
            <footer className="profileFooter">
                <span>NexUs — controle de filiais</span>
            </footer>
        </div>
    );
}
