import { useId, useRef, useState } from "react";
import { FiCamera } from "react-icons/fi";
import type { ReactNode } from "react";

export interface ProfilePhotoPickerProps {
    value: string;
    loading: boolean;
    disabled: boolean;
    error: string;
    children?: ReactNode;
    onSelect: (file: File) => Promise<void>;
    onRemove: () => void;
}

export default function ProfilePhotoPicker({ value, loading, disabled, error, children, onSelect, onRemove }: ProfilePhotoPickerProps) {
    const id = useId();
    const fileRef = useRef<HTMLInputElement>(null);
    const [failedUrl, setFailedUrl] = useState<string | null>(null);
    return (
        <div className="profile-form__photo">
            <input
                ref={fileRef} id={id} className="profile-form__file" type="file" name="profilePhoto"
                accept="image/png,image/jpeg,image/webp" tabIndex={-1} disabled={disabled || loading}
                onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) void onSelect(file); event.currentTarget.value = ""; }}
            />
            <button
                type="button" className="profile-form__photo-picker" disabled={disabled || loading}
                aria-label={value ? "Alterar foto do perfil" : "Adicionar foto do perfil"}
                aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
                onClick={() => fileRef.current?.click()}
            >
                {value && value !== failedUrl ? <img src={value} alt="" onError={() => setFailedUrl(value)} /> : <FiCamera aria-hidden="true" />}
            </button>
            {children}
            <p className="profile-form__sr-only" id={`${id}-help`}>PNG, JPEG ou WebP, até 5 MB e 16 megapixels. A foto será enviada ao salvar.</p>
            {value ? <button className="profile-form__text-button" type="button" disabled={disabled || loading} onClick={onRemove}>Remover foto</button> : null}
            {loading ? <p role="status">Carregando foto...</p> : null}
            {error ? <p className="formFieldError" id={`${id}-error`} role="alert">{error}</p> : null}
        </div>
    );
}
