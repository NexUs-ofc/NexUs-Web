import { useEffect, useRef } from "react";
import type { RefObject } from "react";

export function useDialog(fallbackFocusId: string, modal = true, open = true): RefObject<HTMLDialogElement | null> {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog || !open) return;
        const origin = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        if (modal) {
            dialog.showModal();
            document.body.style.overflow = "hidden";
        } else dialog.show();
        const initial = dialog.querySelector<HTMLElement>("[data-initial-focus]:not(:disabled)")
            ?? dialog.querySelector<HTMLElement>("input:not([type='file']):not(:disabled), select:not(:disabled), textarea:not(:disabled)")
            ?? dialog.querySelector<HTMLElement>("button:not(:disabled)");
        initial?.focus();
        let focusedWithin = dialog.contains(document.activeElement);
        const trackFocus = (event: FocusEvent): void => {
            focusedWithin = event.target instanceof Node && dialog.contains(event.target);
        };
        if (!modal) document.addEventListener("focusin", trackFocus);
        const containFocus = (event: KeyboardEvent): void => {
            if (event.key !== "Tab") return;
            const controls = Array.from(dialog.querySelectorAll<HTMLElement>("button, input, select, textarea, a[href], iframe, [tabindex]"))
                .filter((element) => element.tabIndex >= 0 && !element.matches(":disabled") && element.getClientRects().length > 0);
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault(); last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault(); first?.focus();
            }
        };
        if (modal) dialog.addEventListener("keydown", containFocus);
        return () => {
            const restoreFocus = modal || focusedWithin;
            document.removeEventListener("focusin", trackFocus);
            dialog.removeEventListener("keydown", containFocus);
            dialog.close();
            if (modal) document.body.style.overflow = previousOverflow;
            if (restoreFocus) {
                if (origin?.isConnected) origin.focus();
                else document.getElementById(fallbackFocusId)?.focus();
            }
        };
    }, [fallbackFocusId, modal, open]);

    return dialogRef;
}
