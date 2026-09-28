import type GenericComponentProps from "../../types/common";
import "./error-alert.css";

export interface ErrorAlertProps extends GenericComponentProps {
    message: string;
    title?: string;
}

export default function ErrorAlert({ className = "", id, message, title = "Erro" }: ErrorAlertProps) {
    if (message === "") {
        return null;
    }
    return (
        <div id={id} className={`errorAlert ${className}`} role="alert">
            <strong className="errorAlertTitle">{title}</strong>
            <span className="errorAlertMessage">{message}</span>
        </div>
    );
}
