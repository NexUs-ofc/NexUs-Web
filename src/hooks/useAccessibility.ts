import { useContext } from "react";
import { AccessibilityContext } from "../contexts/AccessibilityContext";

export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (!context) throw new Error("useAccessibility deve ser usado dentro de AccessibilityProvider.");
    return context;
}
