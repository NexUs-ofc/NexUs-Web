/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useLayoutEffect, useState } from "react";
import type { ReactNode } from "react";
import type { AccessibilityPreferences } from "../../types/accessibility";
import {
    applyAccessibilityPreferences,
    clearAccessibilityPreferences,
    DEFAULT_ACCESSIBILITY_PREFERENCES,
    loadAccessibilityPreferences,
    saveAccessibilityPreferences,
    ACCESSIBILITY_STORAGE_KEY,
} from "../../utils/accessibilityPreferences";

interface AccessibilityContextValue {
    preferences: AccessibilityPreferences;
    reducedMotion: boolean;
    systemReducedMotion: boolean;
    storageError: boolean;
    setPreference: <K extends keyof AccessibilityPreferences>(key: K, value: AccessibilityPreferences[K]) => void;
    resetPreferences: () => void;
}

export const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export default function AccessibilityProvider({ children }: { children: ReactNode }) {
    const [preferences, setPreferences] = useState(loadAccessibilityPreferences);
    const [storageError, setStorageError] = useState(false);
    const [systemReducedMotion, setSystemReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    useLayoutEffect(() => {
        applyAccessibilityPreferences(preferences);
    }, [preferences]);

    useEffect(() => {
        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        const onMotionChange = (): void => setSystemReducedMotion(media.matches);
        const onStorageChange = (event: StorageEvent): void => {
            if (event.storageArea === localStorage && (event.key === ACCESSIBILITY_STORAGE_KEY || event.key === null)) {
                setPreferences(loadAccessibilityPreferences());
            }
        };
        media.addEventListener("change", onMotionChange);
        window.addEventListener("storage", onStorageChange);
        return () => {
            media.removeEventListener("change", onMotionChange);
            window.removeEventListener("storage", onStorageChange);
        };
    }, []);

    function setPreference<K extends keyof AccessibilityPreferences>(key: K, value: AccessibilityPreferences[K]): void {
        const next = { ...preferences, [key]: value };
        setPreferences(next);
        setStorageError(!saveAccessibilityPreferences(next));
    }

    function resetPreferences(): void {
        setPreferences({ ...DEFAULT_ACCESSIBILITY_PREFERENCES });
        setStorageError(!clearAccessibilityPreferences());
    }

    return (
        <AccessibilityContext.Provider value={{ preferences, reducedMotion: preferences.reduceMotion || systemReducedMotion, systemReducedMotion, storageError, setPreference, resetPreferences }}>
            {children}
        </AccessibilityContext.Provider>
    );
}
