import { useEffect, useRef, useState } from "react";
import type { Profile, ProfileUpdateData } from "../types/profile";
import { removeProfileImage, updateProfile, uploadProfileImage } from "../services/profile.service";
import { toProfileForm, toProfilePayload } from "../utils/validateProfile";
import { useAuth } from "./useAuth";

const PROFILE_SAVE_TIMEOUT_MS = 30_000;

export function useProfileEditor(profile: Profile) {
    const { updateProfile: updateAuthProfile } = useAuth();
    const [state, setState] = useState({ saving: false, error: "" });
    const currentProfile = useRef(profile);
    const controllerRef = useRef<AbortController | null>(null);
    useEffect(() => () => controllerRef.current?.abort(), []);

    async function save(data: ProfileUpdateData): Promise<boolean> {
        if (controllerRef.current) return false;
        const controller = new AbortController();
        const timeout = AbortSignal.timeout(PROFILE_SAVE_TIMEOUT_MS);
        const signal = AbortSignal.any([controller.signal, timeout]);
        controllerRef.current = controller;
        setState({ saving: true, error: "" });
        let savedDetails = false;
        try {
            const payload = toProfilePayload(data);
            if (JSON.stringify(payload) !== JSON.stringify(toProfilePayload(toProfileForm(currentProfile.current)))) {
                const updated = await updateProfile(payload, { signal });
                signal.throwIfAborted();
                currentProfile.current = updated;
                updateAuthProfile(updated);
                savedDetails = true;
            }
            if (data.photoFile || !data.profileImageUrl && currentProfile.current.profileImageUrl) {
                const image = data.photoFile
                    ? await uploadProfileImage(data.photoFile, { signal })
                    : await removeProfileImage({ signal });
                signal.throwIfAborted();
                currentProfile.current = { ...currentProfile.current, profileImageUrl: image.profileImageUrl };
                updateAuthProfile(currentProfile.current);
            }
            setState({ saving: false, error: "" });
            return true;
        } catch (error) {
            if (!controller.signal.aborted) setState({
                saving: false,
                error: `${savedDetails ? "Os dados foram salvos, mas a foto não foi atualizada. Tente salvar novamente. " : ""}${timeout.aborted
                    ? "O servidor demorou para responder. Confira se as alterações foram salvas antes de tentar novamente."
                    : error instanceof Error ? error.message : "Não foi possível salvar o perfil."}`,
            });
            return false;
        } finally {
            if (controllerRef.current === controller) controllerRef.current = null;
        }
    }

    return { ...state, save };
}
