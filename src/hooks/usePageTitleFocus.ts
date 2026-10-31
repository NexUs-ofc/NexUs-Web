import { useCallback } from "react";

export function usePageTitleFocus(): (element: HTMLHeadingElement | null) => void {
    // O callback só recebe o título quando ele entra no DOM, inclusive após loading.
    return useCallback((element: HTMLHeadingElement | null): void => {
        element?.focus({ preventScroll: true });
    }, []);
}
