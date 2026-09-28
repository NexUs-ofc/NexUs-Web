import { Link } from "react-router-dom";
import type GenericComponentProps from "../../types/common";
import "./app-header.css";

export interface AppHeaderProps extends GenericComponentProps {
    userName: string;
    onLogout: () => void;
}

export default function AppHeader({ className = "", id, userName, onLogout }: AppHeaderProps) {
    return (
        <header id={id} className={`appHeader ${className}`}>
            <nav className="appHeaderNav" aria-label="Navegação principal">
                <Link className="appHeaderBrand" to="/">
                    NexUs
                </Link>
                <div className="appHeaderActions">
                    <span className="appHeaderUser">{userName}</span>
                    <button type="button" className="appHeaderLogout" onClick={onLogout}>
                        Sair
                    </button>
                </div>
            </nav>
        </header>
    );
}
