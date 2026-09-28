import type { ButtonHTMLAttributes, ReactNode } from "react";
import type GenericComponentProps from "../../types/common";
import "./primary-button.css";

export interface PrimaryButtonProps extends GenericComponentProps {
    children: ReactNode;
    type?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
}

export default function PrimaryButton({
    className = "",
    id,
    children,
    type = "submit",
    disabled = false,
    loading = false,
    onClick,
}: PrimaryButtonProps) {
    return (
        <button
            type={type}
            id={id}
            className={`primary-button huninn ${className}`}
            disabled={disabled || loading}
            onClick={onClick}
            aria-busy={loading}
        >
            {loading ? "Carregando..." : children}
        </button>
    );
}
