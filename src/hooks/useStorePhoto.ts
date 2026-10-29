import { useEffect, useRef, useState } from "react";
import { readStorePhoto } from "../utils/storePhoto";

export interface UseStorePhotoResult {
    loading: boolean;
    error: string;
    select: (file: File) => Promise<void>;
    clear: () => void;
}

export function useStorePhoto(onChange: (value: string) => void): UseStorePhotoResult {
    const [state, setState] = useState({ loading: false, error: "" });
    const controllerRef = useRef<AbortController | null>(null);
    useEffect(() => () => controllerRef.current?.abort(), []);

    async function select(file: File): Promise<void> {
        controllerRef.current?.abort();
        const controller = new AbortController();
        controllerRef.current = controller;
        setState({ loading: true, error: "" });
        try {
            const image = await readStorePhoto(file, controller.signal);
            if (!controller.signal.aborted) { onChange(image); setState({ loading: false, error: "" }); }
        } catch (error) {
            if (!controller.signal.aborted) setState({ loading: false, error: error instanceof Error ? error.message : "Erro ao ler a foto." });
        }
    }

    function clear(): void {
        controllerRef.current?.abort();
        onChange("");
        setState({ loading: false, error: "" });
    }

    return { ...state, select, clear };
}
