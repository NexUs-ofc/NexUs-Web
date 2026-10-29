export const STORE_PHOTO_MAX_BYTES = 1024 * 1024;

export async function readStorePhoto(file: File, signal: AbortSignal): Promise<string> {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) throw new Error("Selecione uma imagem PNG, JPEG ou WebP.");
    if (file.size > STORE_PHOTO_MAX_BYTES) throw new Error("A foto deve ter no máximo 1 MB.");
    if (file.size === 0) throw new Error("O arquivo selecionado está vazio.");
    const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    signal.throwIfAborted();
    const png = header[0] === 137 && header[1] === 80 && header[2] === 78 && header[3] === 71;
    const jpeg = header[0] === 255 && header[1] === 216 && header[2] === 255;
    const webp = String.fromCharCode(...header.slice(0, 4)) === "RIFF" && String.fromCharCode(...header.slice(8, 12)) === "WEBP";
    if (!(file.type === "image/png" && png || file.type === "image/jpeg" && jpeg || file.type === "image/webp" && webp)) throw new Error("O conteúdo do arquivo não corresponde a uma foto válida.");
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        const abort = (): void => reader.abort();
        const cleanup = (): void => signal.removeEventListener("abort", abort);
        reader.onload = () => { cleanup(); if (typeof reader.result === "string") resolve(reader.result); else reject(new Error("Não foi possível ler a foto.")); };
        reader.onerror = () => { cleanup(); reject(new Error("Não foi possível ler a foto. Tente outro arquivo.")); };
        reader.onabort = () => { cleanup(); reject(new DOMException("Leitura cancelada.", "AbortError")); };
        signal.addEventListener("abort", abort, { once: true });
        reader.readAsDataURL(file);
    });
}
