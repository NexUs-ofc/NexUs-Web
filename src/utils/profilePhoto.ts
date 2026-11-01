import { validateStorePhoto } from "./storePhoto";

export async function validateProfilePhoto(file: File, signal: AbortSignal): Promise<void> {
    if (!file.size || file.size > 5 * 1024 * 1024) throw new Error("A foto deve ter entre 1 byte e 5 MB.");
    await validateStorePhoto(file, signal);
    const image = await createImageBitmap(file);
    const pixels = image.width * image.height;
    image.close();
    signal.throwIfAborted();
    if (pixels > 16_000_000) throw new Error("A foto deve ter no máximo 16 megapixels.");
}
