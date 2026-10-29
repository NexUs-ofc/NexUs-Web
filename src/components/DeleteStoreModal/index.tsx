import Modal from "../Modal";
import ErrorAlert from "../ErrorAlert";
import type { Store } from "../../types/store";

export interface DeleteStoreModalProps {
    store: Store;
    saving: boolean;
    error: string;
    onConfirm: () => Promise<void>;
    onClose: () => void;
}

export default function DeleteStoreModal({ store, saving, error, onConfirm, onClose }: DeleteStoreModalProps) {
    return (
        <Modal title="Confirmar Exclusão" description={`Tem certeza que deseja excluir a loja “${store.name}”? Esta ação não poderá ser desfeita.`} variant="delete" busy={saving} onCancel={onClose}>
            {error ? <ErrorAlert title="Não foi possível excluir" message={error} /> : null}
            {saving ? <p className="store-form__status" role="status">Excluindo loja...</p> : null}
            <footer className="store-dialog__actions">
                <button type="button" data-initial-focus disabled={saving} onClick={onClose}>Cancelar</button>
                <button type="button" className="store-dialog__delete" disabled={saving} onClick={() => void onConfirm()}>{saving ? "Excluindo..." : "Excluir"}</button>
            </footer>
        </Modal>
    );
}
