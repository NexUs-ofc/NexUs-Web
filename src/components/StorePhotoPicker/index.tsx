import { useId, useRef } from "react";
import type GenericComponentProps from "../../types/common";
import "../../../styles/components/StorePhotoPicker/store-photo-picker.css";

export interface StorePhotoPickerProps extends GenericComponentProps {
    value: string;
    loading: boolean;
    disabled: boolean;
    error: string;
    onSelect: (file: File) => Promise<void>;
    onRemove: () => void;
}

export default function StorePhotoPicker({ value, loading, disabled, error, onSelect, onRemove, className = "" }: StorePhotoPickerProps) {
    const id = useId();
    const fileRef = useRef<HTMLInputElement>(null);
    return (
        <div className={`store-photo ${className}`}>
            {value ? <img className="store-photo__preview" src={value} alt="Pré-visualização da foto da loja" /> : <span className="store-photo__placeholder" aria-hidden="true">Foto</span>}
            <div className="store-photo__controls">
                <label htmlFor={id}>Foto da loja</label>
                <input
                    ref={fileRef} id={id} className="store-photo__input" name="photoDataUrl" type="file"
                    accept="image/png,image/jpeg,image/webp" tabIndex={-1} disabled={disabled}
                    aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`} aria-invalid={Boolean(error)}
                    onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) void onSelect(file); event.currentTarget.value = ""; }}
                />
                <div className="store-photo__buttons">
                    <button type="button" disabled={disabled || loading} onClick={() => fileRef.current?.click()}>{value ? "Alterar foto" : "Selecionar foto"}</button>
                    {value ? <button type="button" disabled={disabled || loading} onClick={onRemove}>Remover foto</button> : null}
                </div>
                <p id={`${id}-help`}>PNG, JPEG ou WebP, até 10 MB. A foto será atualizada ao salvar a filial.</p>
                {loading ? <p role="status">Carregando foto...</p> : null}
                {error ? <p className="store-photo__error" id={`${id}-error`} role="alert">{error}</p> : null}
            </div>
        </div>
    );
}
