import { useId } from "react";
import type GenericComponentProps from "../../types/common";
import { useDialog } from "../../hooks/useDialog";
import "./modal.css";

export interface ModalProps extends GenericComponentProps {
    title: string;
    description: string;
    variant: "edit" | "delete";
    busy: boolean;
    onCancel: () => void;
}

export default function Modal({ title, description, variant, busy, onCancel, children, className = "", id }: ModalProps) {
    const titleId = useId();
    const dialogRef = useDialog("stores-title");
    return (
        <dialog
            ref={dialogRef}
            id={id}
            className={`store-dialog store-dialog--${variant} ${className}`}
            role={variant === "delete" ? "alertdialog" : "dialog"}
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={`${titleId}-description`}
            aria-busy={busy}
            onCancel={(event) => { event.preventDefault(); if (!busy) onCancel(); }}
        >
            <header className="store-dialog__header">
                {variant === "delete" ? <span className="store-dialog__warning" aria-hidden="true">⚠︎</span> : null}
                <h2 id={titleId}>{title}</h2>
                <p id={`${titleId}-description`}>{description}</p>
            </header>
            {children}
        </dialog>
    );
}
