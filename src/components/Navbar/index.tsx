import type GenericComponentProps from "../../types/common";
import elementsIcon from "../../../assets/dashboards/elements.svg";
import logoutIcon from "../../../assets/dashboards/logout.svg";
import { NavLink } from "react-router-dom";
import "../../../styles/components/Navbar/navbar.css";

export type NavbarDestination = "dashboard" | "stores" | "plans" | "reports" | "payments";

export interface NavbarProps extends GenericComponentProps {
    onSignOut: () => void;
}

const navigationItems: ReadonlyArray<{
    destination: NavbarDestination;
    label: string;
    path: string;
}> = [
    { destination: "dashboard", label: "Dashboard", path: "/dashboard" },
    { destination: "stores", label: "Lojas", path: "/lojas" },
    { destination: "plans", label: "Planos", path: "/dashboard/planos" },
    { destination: "reports", label: "Relatórios", path: "/relatorios" },
    { destination: "payments", label: "Pagamentos", path: "/pagamentos" },
];

export default function Navbar({
    onSignOut,
    className = "",
    id,
}: NavbarProps) {
    return (
        <aside className={`navbar ${className}`} id={id} aria-label="Barra lateral">
            <div className="navbar__top">
                <div className="navbar__brand" role="img" aria-label="Ceris">
                    <span className="navbar__brand-mark" aria-hidden="true">
                        <img src={elementsIcon} alt="" />
                    </span>
                    <span className="navbar__brand-name">Ceris</span>
                </div>

                <nav className="navbar__navigation" aria-label="Navegação principal">
                    {navigationItems.map((item) => {
                        return (
                            <NavLink
                                key={item.destination}
                                to={item.path}
                                end={item.destination !== "stores"}
                                className={({ isActive }) =>
                                    `navbar__item${isActive ? " navbar__item--active" : ""}${item.destination === "reports" ? " navbar__item--reports" : ""}`
                                }
                                aria-label={item.label}
                                title={item.label}
                            >
                                <span
                                    className={`navbar__item-icon navbar__item-icon--${item.destination}`}
                                    aria-hidden="true"
                                />
                                <span className="navbar__item-label">{item.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <button
                className="navbar__sign-out"
                type="button"
                onClick={onSignOut}
                aria-label="Sair do Portal"
                title="Sair do Portal"
            >
                <img src={logoutIcon} alt="" />
                <span className="navbar__sign-out-label">Sair do Portal</span>
            </button>
        </aside>
    );
}
