import type { AccessibilityPreferences } from "../types/accessibility";

export const ACCESSIBILITY_STORAGE_KEY = "nexus-accessibility-preferences";

export const DEFAULT_ACCESSIBILITY_PREFERENCES: Readonly<AccessibilityPreferences> = {
    textSize: 100,
    contrast: "standard",
    highlightFocus: true,
    dyslexiaFont: false,
    monochrome: false,
};

export function loadAccessibilityPreferences(): AccessibilityPreferences {
    try {
        const value: unknown = JSON.parse(localStorage.getItem(ACCESSIBILITY_STORAGE_KEY) ?? "null");
        if (typeof value !== "object" || value === null || Array.isArray(value)) {
            return { ...DEFAULT_ACCESSIBILITY_PREFERENCES };
        }
        const stored = value as Record<string, unknown>;
        return {
            textSize: stored.textSize === 125 || stored.textSize === 150 ? stored.textSize : 100,
            contrast: stored.contrast === "high" ? "high" : "standard",
            highlightFocus: typeof stored.highlightFocus === "boolean" ? stored.highlightFocus : true,
            dyslexiaFont: stored.dyslexiaFont === true,
            monochrome: stored.monochrome === true,
        };
    } catch {
        return { ...DEFAULT_ACCESSIBILITY_PREFERENCES };
    }
}

export function saveAccessibilityPreferences(preferences: AccessibilityPreferences): boolean {
    try {
        localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(preferences));
        return true;
    } catch {
        return false;
    }
}

export function clearAccessibilityPreferences(): boolean {
    try {
        localStorage.removeItem(ACCESSIBILITY_STORAGE_KEY);
        return true;
    } catch {
        return false;
    }
}

export function applyAccessibilityPreferences(preferences: AccessibilityPreferences): void {
    const root = document.documentElement;
    root.dataset.a11yTextSize = String(preferences.textSize);
    root.dataset.a11yContrast = preferences.contrast;
    root.dataset.a11yHighlightFocus = String(preferences.highlightFocus);
    root.dataset.a11yDyslexiaFont = String(preferences.dyslexiaFont);
    root.dataset.a11yMonochrome = String(preferences.monochrome);
}
