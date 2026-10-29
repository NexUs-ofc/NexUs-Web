import Modal from "../Modal";
import StoreForm from "../StoreForm";
import type { Store, StoreFormData } from "../../types/store";
import { toStoreForm } from "../../utils/validateStore";

export interface EditStoreModalProps {
    store: Store;
    saving: boolean;
    error: string;
    onSave: (data: StoreFormData) => Promise<boolean>;
    onClose: () => void;
}

export default function EditStoreModal({ store, saving, error, onSave, onClose }: EditStoreModalProps) {
    return (
        <Modal title="Editar Loja" description="Insira as novas informações básicas da unidade" variant="edit" busy={saving} onCancel={onClose}>
            <StoreForm mode="edit" initialData={toStoreForm(store)} saving={saving} error={error} onSave={onSave} onSaved={onClose} onCancel={onClose} />
        </Modal>
    );
}
