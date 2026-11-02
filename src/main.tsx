import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import AccessibilityProvider from "./contexts/AccessibilityContext";
import { applyAccessibilityPreferences, loadAccessibilityPreferences } from "./utils/accessibilityPreferences";
import "../styles/accessibility.css";

applyAccessibilityPreferences(loadAccessibilityPreferences());

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <AccessibilityProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </AccessibilityProvider>
    </StrictMode>
);
