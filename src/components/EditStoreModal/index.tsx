import Modal from "../Modal";
import StoreForm from "../StoreForm";
import type { Store, StoreFormData } from "../../types/store";
import { toStoreForm } from "../../utils/validateStore";
import { useStoreDetails } from "../../hooks/useStoreDetails";
import LoadingSpinner from "../LoadingSpinner";
import ErrorAlert from "../ErrorAlert";
import PrimaryButton from "../PrimaryButton";

export interface EditStoreModalProps {
    store: Store;
    saving: boolean;
    error: string;
    onSave: (data: StoreFormData) => Promise<boolean>;
    onClose: () => void;
}

export default function EditStoreModal({ store, saving, error, onSave, onClose }: EditStoreModalProps) {
    const details = useStoreDetails(store);
    return (
        <Modal title="Editar Loja" description="Insira as novas informações básicas da unidade" variant="edit" busy={saving} onCancel={onClose}>
            {details.loading || details.error ? (
                <>
                    {details.loading ? <LoadingSpinner message="Carregando dados da filial..." />
                        : <ErrorAlert title="Não foi possível carregar a filial" message={details.error} />}
                    <footer className="store-dialog__actions">
                        <button type="button" onClick={onClose}>Cancelar</button>
                        {!details.loading && details.error ? <PrimaryButton type="button" onClick={details.reload}>Tentar novamente</PrimaryButton> : null}
                    </footer>
                </>
            ) : details.store ? <StoreForm mode="edit" initialData={toStoreForm(details.store)} saving={saving} error={error} onSave={onSave} onSaved={onClose} onCancel={onClose} /> : null}
        </Modal>
    );
}
