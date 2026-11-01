/** Entrega um Blob ao usuário como arquivo baixado, sem navegar para fora da aplicação. */
export function saveBlobAsFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    document.body.append(link);
    link.click();
    link.remove();
    // O navegador já iniciou o download; liberar no próximo ciclo evita cancelá-lo.
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
}
