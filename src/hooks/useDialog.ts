import { useEffect, useRef } from "react";
import type { RefObject } from "react";

export function useDialog(fallbackFocusId: string): RefObject<HTMLDialogElement | null> {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const origin = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const previousOverflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = "hidden";
        const initial = dialog.querySelector<HTMLElement>("[data-initial-focus]")
            ?? dialog.querySelector<HTMLElement>("input:not([type='file']), select")
            ?? dialog.querySelector<HTMLElement>("button");
        initial?.focus();
        const containFocus = (event: KeyboardEvent): void => {
            if (event.key !== "Tab") return;
            const controls = Array.from(dialog.querySelectorAll<HTMLElement>("button, input, select, textarea, a[href], [tabindex]"))
                .filter((element) => element.tabIndex >= 0 && !element.matches(":disabled") && element.getClientRects().length > 0);
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault(); last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault(); first?.focus();
            }
        };
        dialog.addEventListener("keydown", containFocus);
        return () => {
            dialog.removeEventListener("keydown", containFocus);
            dialog.close();
            document.body.style.overflow = previousOverflow;
            if (origin?.isConnected) origin.focus();
            else document.getElementById(fallbackFocusId)?.focus();
        };
    }, [fallbackFocusId]);

    return dialogRef;
}
