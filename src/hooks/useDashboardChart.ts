import { useEffect, useState } from "react";
import type { RefObject } from "react";
import { createDashboardChart } from "../utils/chartEngine";
import type { DashboardChartOption } from "../utils/chartEngine";

export function useDashboardChart(container: RefObject<HTMLDivElement | null>, option: DashboardChartOption, mapSource?: string): string {
    const [error, setError] = useState("");

    useEffect(() => {
        const element = container.current;
        if (!element) return;
        let disposed = false;
        let chart: ReturnType<typeof createDashboardChart> | null = null;
        const render = (): void => {
            if (disposed || element.clientWidth === 0 || element.clientHeight === 0) return;
            try {
                if (!chart) {
                    chart = createDashboardChart(element, mapSource);
                    chart.setOption(option, { notMerge: true });
                } else chart.resize();
            } catch {
                chart?.dispose();
                chart = null;
                if (!disposed) setError("Não foi possível desenhar este gráfico. Consulte os valores em Ver dados.");
            }
        };
        // Aguarda o layout e observa o card, inclusive ao redimensionar ou ampliar a página.
        const observer = new ResizeObserver(render);
        observer.observe(element);
        void document.fonts.ready.then(render);
        void Promise.resolve().then(render);
        return () => {
            disposed = true;
            observer.disconnect();
            chart?.dispose();
        };
    }, [container, option, mapSource]);

    return error;
}
