import { useEffect, useRef, useState } from "react";

export function useProfilePhoto(initialUrl: string) {
    const [state, setState] = useState({ file: null as File | null, url: initialUrl, loading: false, error: "" });
    const selection = useRef(0);
    useEffect(() => () => { selection.current += 1; }, []);
    useEffect(() => () => { if (state.file) URL.revokeObjectURL(state.url); }, [state.file, state.url]);

    async function select(file: File): Promise<void> {
        const version = ++selection.current;
        setState((previous) => ({ ...previous, loading: true, error: "" }));
        try {
            if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) throw new Error("Selecione uma imagem PNG, JPEG ou WebP.");
            if (!file.size || file.size > 5 * 1024 * 1024) throw new Error("A foto deve ter entre 1 byte e 5 MB.");
            const image = await createImageBitmap(file);
            const pixels = image.width * image.height;
            image.close();
            if (pixels > 16_000_000) throw new Error("A foto deve ter no máximo 16 megapixels.");
            if (version === selection.current) setState({ file, url: URL.createObjectURL(file), loading: false, error: "" });
        } catch (error) {
            if (version === selection.current) setState((previous) => ({ ...previous, loading: false, error: error instanceof DOMException ? "Não foi possível ler a foto. Selecione uma imagem válida." : error instanceof Error ? error.message : "Não foi possível ler a foto." }));
        }
    }

    function remove(): void {
        selection.current += 1;
        setState({ file: null, url: "", loading: false, error: "" });
    }

    return { ...state, select, remove };
}
