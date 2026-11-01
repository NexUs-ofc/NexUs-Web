import { useRef, useState } from "react";
import type { KeyboardEvent } from "react";

export function useChartView() {
    const [showData, setShowData] = useState(false);
    const tabs = useRef<(HTMLButtonElement | null)[]>([]);
    function select(index: number): void {
        setShowData(index === 1);
        tabs.current[index]?.focus();
    }
    function onKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
        const index = showData ? 1 : 0;
        const target = event.key === "Home" ? 0 : event.key === "End" ? 1
            : event.key === "ArrowRight" || event.key === "ArrowLeft" ? 1 - index : null;
        if (target === null) return;
        event.preventDefault();
        select(target);
    }
    return { showData, tabs, select, onKeyDown };
}
