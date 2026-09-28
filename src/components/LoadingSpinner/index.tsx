import type GenericComponentProps from "../../types/common";
import "./loading-spinner.css";

export interface LoadingSpinnerProps extends GenericComponentProps {
    message?: string;
}

export default function LoadingSpinner({
    className = "",
    id,
    message = "Carregando...",
}: LoadingSpinnerProps) {
    return (
        <div
            id={id}
            className={`loadingSpinnerContainer ${className}`}
            role="status"
            aria-live="polite"
            aria-label={message}
        >
            <span className="loadingSpinner" aria-hidden="true" />
            <span className="loadingSpinnerText">{message}</span>
        </div>
    );
}
