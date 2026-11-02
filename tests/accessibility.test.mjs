import assert from "node:assert/strict";
import test from "node:test";
import {
    ACCESSIBILITY_STORAGE_KEY,
    DEFAULT_ACCESSIBILITY_PREFERENCES,
    clearAccessibilityPreferences,
    loadAccessibilityPreferences,
    saveAccessibilityPreferences,
} from "../src/utils/accessibilityPreferences.ts";

function mockStorage(t, value) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value });
    t.after(() => {
        if (previous) Object.defineProperty(globalThis, "localStorage", previous);
        else delete globalThis.localStorage;
    });
}

function storage(t, initial = {}) {
    const values = new Map(Object.entries(initial));
    mockStorage(t, {
        getItem: (key) => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
        removeItem: (key) => values.delete(key),
    });
    return values;
}

test("preserves existing choices while replacing obsolete accessibility options", (t) => {
    storage(t, {
        [ACCESSIBILITY_STORAGE_KEY]: JSON.stringify({ textSize: 150, contrast: "high", highlightFocus: false, reduceMotion: true, underlineLinks: true }),
    });
    assert.deepEqual(loadAccessibilityPreferences(), {
        textSize: 150, contrast: "high", highlightFocus: false, dyslexiaFont: false, monochrome: false,
    });
});

test("restores the font and palette choices after saving", (t) => {
    storage(t);
    const preferences = { ...DEFAULT_ACCESSIBILITY_PREFERENCES, dyslexiaFont: true, monochrome: true };
    assert.equal(saveAccessibilityPreferences(preferences), true);
    assert.deepEqual(loadAccessibilityPreferences(), preferences);
});

test("falls back safely for malformed or unsupported stored preferences", (t) => {
    const values = storage(t);
    for (const value of ["invalid JSON", "null", "[]", JSON.stringify({ textSize: 200, contrast: "invalid", highlightFocus: "false", dyslexiaFont: "true", monochrome: 1 })]) {
        values.set(ACCESSIBILITY_STORAGE_KEY, value);
        assert.deepEqual(loadAccessibilityPreferences(), DEFAULT_ACCESSIBILITY_PREFERENCES);
    }
});

test("reset removes only accessibility preferences", (t) => {
    const values = storage(t, { [ACCESSIBILITY_STORAGE_KEY]: "{}", "another-preference": "preserved" });
    assert.equal(clearAccessibilityPreferences(), true);
    assert.deepEqual(loadAccessibilityPreferences(), DEFAULT_ACCESSIBILITY_PREFERENCES);
    assert.equal(values.get("another-preference"), "preserved");
});

test("keeps defaults and reports persistence failure when browser storage is unavailable", (t) => {
    mockStorage(t, { getItem() { throw new Error("Storage unavailable"); }, setItem() { throw new Error("Storage unavailable"); }, removeItem() { throw new Error("Storage unavailable"); } });
    assert.deepEqual(loadAccessibilityPreferences(), DEFAULT_ACCESSIBILITY_PREFERENCES);
    assert.equal(saveAccessibilityPreferences({ ...DEFAULT_ACCESSIBILITY_PREFERENCES }), false);
    assert.equal(clearAccessibilityPreferences(), false);
});
