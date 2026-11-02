import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test, { beforeEach } from "node:test";

const env = {
    VITE_AUTH_API_BASE_URL: "https://auth.test",
    VITE_AUTH_API_KEY: "auth-test-key",
    VITE_CORE_API_BASE_URL: "https://core.test",
    VITE_CHATBOT_API_BASE_URL: "https://bi.test",
    VITE_CHATBOT_API_KEY: "bi-test-key",
};
registerHooks({
    resolve(specifier, context, nextResolve) {
        try { return nextResolve(specifier, context); }
        catch (error) {
            if (specifier.startsWith(".") && error.code === "ERR_MODULE_NOT_FOUND") return nextResolve(specifier + ".ts", context);
            throw error;
        }
    },
    load(url, context, nextLoad) {
        const result = nextLoad(url, context);
        if (!url.includes("/src/") || !url.includes(".ts")) return result;
        return { ...result, source: String(result.source).replace(/import\.meta\.env\.(\w+)/gu, (_, key) => JSON.stringify(env[key]) ?? "undefined") };
    },
});

const { getAuthSession, getSessionAccessToken, setAuthSession, restoreAuthSession, updateSessionProfile, subscribeAuthSession, maintainAuthSession } = await import("../src/services/sessionManager.ts");
const { AUTH_STORAGE_KEY, loadAuthSession, saveAuthSession } = await import("../src/utils/authStorage.ts");
const { coreRequest } = await import("../src/services/coreClient.ts");
const { reportsRequest, reportsRequestBlob } = await import("../src/services/reportsClient.ts");
const { chatbotRequest } = await import("../src/services/chatbotClient.ts");
const { getProfile } = await import("../src/services/profile.service.ts");

const NOW = Date.parse("2026-11-02T15:00:00Z");
const iso = (offset) => new Date(NOW + offset).toISOString();
const profile = {
    id: 1, name: "Empresa", email: "empresa@example.com", profileType: "COMPANY", profileStatus: "ACTIVE",
    profileImageUrl: null, createdAt: iso(-86_400_000), phones: [], address: null,
};
const stored = new Map();
Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
        getItem: (key) => stored.get(key) ?? null,
        setItem: (key, value) => { stored.set(key, String(value)); },
        removeItem: (key) => { stored.delete(key); },
    },
});

function session(overrides = {}) {
    return { profile, accessToken: "access-old", expiresAt: iso(900_000), refreshToken: "refresh-old", refreshExpiresAt: iso(30 * 86_400_000), ...overrides };
}
function tokens() {
    return { accessToken: "access-new", accessTokenExpiresAt: iso(900_000), refreshToken: "refresh-new", refreshTokenExpiresAt: iso(30 * 86_400_000) };
}
function deferred() {
    let resolve;
    const promise = new Promise((r) => { resolve = r; });
    return { promise, resolve };
}
function mockHttp(t, respond) {
    const calls = [];
    t.mock.method(globalThis, "fetch", async (url, options) => {
        const call = { url, ...options };
        calls.push(call);
        return respond(call);
    });
    return calls;
}
function replaceGlobal(t, key, value) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { configurable: true, value });
    t.after(() => {
        if (descriptor) Object.defineProperty(globalThis, key, descriptor);
        else delete globalThis[key];
    });
}

beforeEach((t) => {
    stored.clear();
    setAuthSession(null);
    t.mock.method(Date, "now", () => NOW);
    t.mock.method(globalThis, "fetch", () => { throw new Error("Unexpected request"); });
});

test("restores an expired access with a valid refresh and shares renewal across repeated restores", async (t) => {
    saveAuthSession(session({ expiresAt: iso(-1) }));
    assert.equal(loadAuthSession().refreshToken, "refresh-old");
    const isolated = await import("../src/services/sessionManager.ts?restore");
    assert.equal(isolated.restoreAuthSession().refreshToken, "refresh-old");
    isolated.restoreAuthSession();
    const calls = mockHttp(t, () => Response.json(tokens()));
    assert.deepEqual(await Promise.all([isolated.getSessionAccessToken(), isolated.getSessionAccessToken()]), ["access-new", "access-new"]);
    assert.equal(calls.length, 1);
    assert.equal(restoreAuthSession(), null);
});

test("shares one refresh across Core, reports, PDF and chatbot and persists rotation before notifying", async (t) => {
    setAuthSession(session({ expiresAt: iso(-1) }));
    const gate = deferred();
    const started = deferred();
    const calls = mockHttp(t, async (call) => {
        if (call.url === "https://auth.test/api/auth/token/refresh") {
            started.resolve();
            await gate.promise;
            assert.deepEqual(JSON.parse(call.body), { refreshToken: "refresh-old" });
            assert.equal(call.credentials, "omit");
            assert.equal(call.headers["X-API-KEY"], "auth-test-key");
            return Response.json(tokens());
        }
        assert.equal(call.headers.Authorization, "Bearer access-new");
        if (call.url.endsWith("/pdf")) return new Response("pdf-content", { headers: { "Content-Type": "application/pdf" } });
        return Response.json({ ok: true });
    });
    const unsubscribe = subscribeAuthSession((value) => {
        if (value?.accessToken === "access-new") assert.equal(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)).refreshToken, "refresh-new");
    });
    t.after(unsubscribe);
    const requests = [coreRequest("/data"), reportsRequest("/dashboard"), reportsRequestBlob("/pdf"), chatbotRequest("/chat", { method: "POST", body: { question: "oi" } })];
    await started.promise;
    assert.equal(calls.length, 1);
    gate.resolve();
    const result = await Promise.all(requests);
    assert.equal(await result[2].text(), "pdf-content");
    assert.equal(calls.length, 5);
    assert.equal(getAuthSession().refreshToken, "refresh-new");
    assert.equal(calls.filter((call) => call.url.endsWith("/profile")).length, 0);
    assert.equal(calls.find((call) => call.url === "https://core.test/data").credentials, "include");
    assert.equal(calls.find((call) => call.url === "https://bi.test/dashboard").credentials, "omit");
});

test("uses a valid access without contacting Auth", async (t) => {
    setAuthSession(session());
    const calls = mockHttp(t, (call) => {
        assert.equal(call.headers.Authorization, "Bearer access-old");
        return Response.json({ ok: true });
    });
    await coreRequest("/data");
    assert.equal(calls.length, 1);
});

test("renews within the 30-second margin before sending the request", async (t) => {
    setAuthSession(session({ expiresAt: iso(25_000) }));
    const calls = mockHttp(t, (call) => Response.json(call.url.startsWith("https://auth.test") ? tokens() : { ok: true }));
    await coreRequest("/data");
    assert.equal(calls[0].url, "https://auth.test/api/auth/token/refresh");
    assert.equal(calls[1].headers.Authorization, "Bearer access-new");
});

test("retries a 401 once with the renewed access and the original POST body", async (t) => {
    setAuthSession(session());
    const calls = mockHttp(t, (call) => {
        if (call.url.startsWith("https://auth.test")) return Response.json(tokens());
        return Response.json({ ok: true }, { status: call.headers.Authorization === "Bearer access-old" ? 401 : 200 });
    });
    await coreRequest("/data", { method: "POST", body: { name: "Filial" } });
    assert.equal(calls.length, 3);
    assert.equal(calls[0].body, calls[2].body);
    assert.equal(calls[2].method, "POST");
});

test("retries multipart uploads without losing FormData", async (t) => {
    setAuthSession(session());
    const body = new FormData();
    body.append("file", new Blob(["image"]), "image.png");
    const calls = mockHttp(t, (call) => call.url.startsWith("https://auth.test")
        ? Response.json(tokens()) : Response.json({}, { status: call.headers.Authorization === "Bearer access-old" ? 401 : 200 }));
    await coreRequest("/upload", { method: "PUT", body });
    assert.equal(calls[0].body, body);
    assert.equal(calls[2].body, body);
    assert.equal(calls[2].headers["Content-Type"], undefined);
});

test("a persistent resource 401 stops after one retry and does not discard the rotated refresh", async (t) => {
    setAuthSession(session());
    const calls = mockHttp(t, (call) => call.url.startsWith("https://auth.test") ? Response.json(tokens()) : Response.json({}, { status: 401 }));
    await assert.rejects(coreRequest("/data"), { status: 401 });
    assert.equal(calls.length, 3);
    assert.equal(getAuthSession().refreshToken, "refresh-new");
});

for (const status of [403, 500]) {
    test(`does not refresh on a resource ${status}`, async (t) => {
        setAuthSession(session());
        const calls = mockHttp(t, () => Response.json({}, { status }));
        await assert.rejects(coreRequest("/data"), { status });
        assert.equal(calls.length, 1);
        assert.equal(getAuthSession().refreshToken, "refresh-old");
    });
}

test("an Auth 401 clears the invalid session from memory and storage", async (t) => {
    setAuthSession(session({ expiresAt: iso(-1) }));
    const calls = mockHttp(t, () => Response.json({ message: "Credencial inválida ou expirada" }, { status: 401 }));
    await assert.rejects(coreRequest("/data"), { status: 401 });
    assert.equal(calls.length, 1);
    assert.equal(getAuthSession(), null);
    assert.equal(localStorage.getItem(AUTH_STORAGE_KEY), null);
});

for (const status of [0, 403, 503]) {
    test(`preserves the refresh after an Auth failure (${status}) and allows recovery`, async (t) => {
        setAuthSession(session({ expiresAt: iso(-1) }));
        const calls = mockHttp(t, () => {
            if (status === 0) throw new TypeError("Failed to fetch");
            return Response.json({}, { status });
        });
        await assert.rejects(coreRequest("/data"), { status });
        assert.equal(calls.length, 1);
        assert.equal(getAuthSession().refreshToken, "refresh-old");
        assert.equal(loadAuthSession().refreshToken, "refresh-old");
        mockHttp(t, (call) => Response.json(call.url.startsWith("https://auth.test") ? tokens() : {}));
        await coreRequest("/data");
        assert.equal(getAuthSession().refreshToken, "refresh-new");
    });
}

for (const action of ["logout", "login"]) {
    test(`ignores a late refresh response after ${action}`, async (t) => {
        setAuthSession(session({ expiresAt: iso(-1) }));
        const gate = deferred();
        const started = deferred();
        mockHttp(t, async () => { started.resolve(); await gate.promise; return Response.json(tokens()); });
        const request = coreRequest("/data");
        await started.promise;
        setAuthSession(action === "logout" ? null : session({ profile: { ...profile, id: 2 }, accessToken: "other-access", refreshToken: "other-refresh" }));
        gate.resolve();
        await assert.rejects(request, { status: 0 });
        if (action === "logout") {
            assert.equal(getAuthSession(), null);
            assert.equal(localStorage.getItem(AUTH_STORAGE_KEY), null);
        } else {
            assert.equal(getAuthSession().refreshToken, "other-refresh");
            assert.equal(loadAuthSession().profile.id, 2);
        }
    });
}

test("profile updates during a refresh preserve both the updated profile and rotated credentials", async (t) => {
    setAuthSession(session({ expiresAt: iso(-1) }));
    const gate = deferred();
    const started = deferred();
    const calls = mockHttp(t, async (call) => {
        if (!call.url.startsWith("https://auth.test")) return Response.json({});
        started.resolve(); await gate.promise; return Response.json(tokens());
    });
    const first = coreRequest("/first");
    await started.promise;
    updateSessionProfile({ ...profile, name: "Nome atualizado" });
    const second = coreRequest("/second");
    gate.resolve();
    await Promise.all([first, second]);
    assert.equal(calls.filter((call) => call.url.startsWith("https://auth.test")).length, 1);
    assert.equal(loadAuthSession().profile.name, "Nome atualizado");
    assert.equal(loadAuthSession().refreshToken, "refresh-new");
});

test("aborting one caller does not cancel the refresh needed by other callers", async (t) => {
    setAuthSession(session({ expiresAt: iso(-1) }));
    const gate = deferred();
    const started = deferred();
    const controller = new AbortController();
    const calls = mockHttp(t, async (call) => {
        if (!call.url.startsWith("https://auth.test")) return Response.json({});
        assert.notEqual(call.signal, controller.signal);
        assert.equal(call.signal.aborted, false);
        started.resolve(); await gate.promise; return Response.json(tokens());
    });
    const cancelled = coreRequest("/cancelled", { signal: controller.signal });
    const other = coreRequest("/other");
    await started.promise;
    controller.abort();
    gate.resolve();
    await assert.rejects(cancelled, { status: 0 });
    await other;
    assert.equal(calls.length, 2);
    assert.equal(calls[1].url, "https://core.test/other");
    assert.equal(loadAuthSession().refreshToken, "refresh-new");
});

test("an already cancelled request does not refresh or contact the resource", async () => {
    setAuthSession(session({ expiresAt: iso(-1) }));
    await assert.rejects(coreRequest("/data", { signal: AbortSignal.abort() }), { status: 0 });
    assert.equal(getAuthSession().refreshToken, "refresh-old");
});

test("late parallel 401 responses reuse the access already renewed by another request", async (t) => {
    setAuthSession(session());
    const late = deferred();
    const calls = mockHttp(t, async (call) => {
        if (call.url.startsWith("https://auth.test")) return Response.json(tokens());
        if (call.headers.Authorization === "Bearer access-new") return Response.json({});
        if (call.url.endsWith("/late")) await late.promise;
        return Response.json({}, { status: 401 });
    });
    const first = coreRequest("/first");
    const second = coreRequest("/late");
    await first;
    late.resolve();
    await second;
    assert.equal(calls.filter((call) => call.url.startsWith("https://auth.test")).length, 1);
});

test("expired refresh tokens never reach Auth and a still-valid access remains usable", async (t) => {
    setAuthSession(session({ refreshExpiresAt: iso(-1) }));
    const calls = mockHttp(t, () => Response.json({}));
    await coreRequest("/data");
    assert.equal(calls.length, 1);
    setAuthSession(session({ expiresAt: iso(-1), refreshExpiresAt: iso(-1) }));
    await assert.rejects(coreRequest("/data"), { status: 401 });
    assert.equal(calls.length, 1);
    assert.equal(getAuthSession(), null);
});

test("a rotation saved by another tab is reused after acquiring the shared lock", async (t) => {
    setAuthSession(session({ expiresAt: iso(-1) }));
    const gate = deferred();
    const waiting = deferred();
    replaceGlobal(t, "navigator", { locks: { request: async (name, callback) => {
        assert.equal(name, "nexus-auth-refresh");
        waiting.resolve(); await gate.promise; return callback();
    } } });
    const request = getSessionAccessToken();
    await waiting.promise;
    saveAuthSession(session({ accessToken: "tab-access", refreshToken: "tab-refresh" }));
    gate.resolve();
    assert.equal(await request, "tab-access");
    assert.equal(getAuthSession().refreshToken, "tab-refresh");
});

test("an already-expired rotation from another tab is renewed without nesting locks", async (t) => {
    setAuthSession(session({ expiresAt: iso(-1) }));
    saveAuthSession(session({ expiresAt: iso(-1), accessToken: "tab-access", refreshToken: "tab-refresh" }));
    let locked = false;
    replaceGlobal(t, "navigator", { locks: { request: async (_name, callback) => {
        assert.equal(locked, false);
        locked = true;
        try { return await callback(); } finally { locked = false; }
    } } });
    const calls = mockHttp(t, (call) => {
        assert.deepEqual(JSON.parse(call.body), { refreshToken: "tab-refresh" });
        return Response.json(tokens());
    });
    assert.deepEqual(await Promise.all([getSessionAccessToken(), getSessionAccessToken()]), ["access-new", "access-new"]);
    assert.equal(calls.length, 1);
});

test("a logout in another tab prevents rotation even before its storage event arrives", async () => {
    setAuthSession(session({ expiresAt: iso(-1) }));
    localStorage.removeItem(AUTH_STORAGE_KEY);
    await assert.rejects(getSessionAccessToken(), { status: 401 });
    assert.equal(getAuthSession(), null);
});

test("two independent tabs serialize rotation through Web Locks and use the same new credentials", async (t) => {
    saveAuthSession(session({ expiresAt: iso(-1) }));
    const tabA = await import("../src/services/sessionManager.ts?tab-a");
    const tabB = await import("../src/services/sessionManager.ts?tab-b");
    tabA.restoreAuthSession();
    tabB.restoreAuthSession();
    let queue = Promise.resolve();
    replaceGlobal(t, "navigator", { locks: { request: (_name, callback) => {
        const next = queue.then(callback);
        queue = next.catch(() => {});
        return next;
    } } });
    const calls = mockHttp(t, () => Response.json(tokens()));
    assert.deepEqual(await Promise.all([tabA.getSessionAccessToken(), tabB.getSessionAccessToken()]), ["access-new", "access-new"]);
    assert.equal(calls.length, 1);
    assert.equal(tabA.getAuthSession().refreshToken, "refresh-new");
    assert.equal(tabB.getAuthSession().refreshToken, "refresh-new");
});

test("failed storage writes retain the latest refresh in memory instead of reusing a stale persisted token", async (t) => {
    saveAuthSession(session({ expiresAt: iso(-1), refreshToken: "stale-refresh" }));
    t.mock.method(localStorage, "setItem", () => { throw new Error("Storage full"); });
    setAuthSession(session({ expiresAt: iso(-1), refreshToken: "latest-refresh" }));
    const calls = mockHttp(t, (call) => {
        assert.deepEqual(JSON.parse(call.body), { refreshToken: "latest-refresh" });
        return Response.json(tokens());
    });
    assert.equal(await getSessionAccessToken(), "access-new");
    assert.equal(calls.length, 1);
    assert.equal(getAuthSession().refreshToken, "refresh-new");
});

test("login profile requests use their explicit fresh token without changing the current session", async (t) => {
    const calls = mockHttp(t, (call) => {
        assert.equal(call.headers.Authorization, "Bearer login-access");
        return Response.json(profile);
    });
    assert.equal((await getProfile({ authToken: "login-access" })).id, 1);
    assert.equal(calls.length, 1);
    assert.equal(getAuthSession(), null);
});

test("maintains the session before expiry, retries transient failures and cleans up listeners", async (t) => {
    let stop = () => {};
    t.after(() => stop());
    const browser = new EventTarget();
    const document = new EventTarget();
    document.visibilityState = "visible";
    replaceGlobal(t, "window", browser);
    replaceGlobal(t, "document", document);
    const scheduled = [];
    t.mock.method(globalThis, "setTimeout", (callback, delay) => { scheduled.push({ callback, delay }); return scheduled.length; });
    const clear = t.mock.method(globalThis, "clearTimeout", () => {});
    setAuthSession(session());
    stop = maintainAuthSession();
    assert.equal(scheduled.at(-1).delay, 870_000);
    t.mock.method(Date, "now", () => NOW + 880_000);
    const calls = mockHttp(t, () => Response.json({}, { status: 503 }));
    scheduled.at(-1).callback();
    for (let i = 0; i < 30; i += 1) await Promise.resolve();
    assert.equal(calls.length, 1);
    assert.equal(scheduled.at(-1).delay, 30_000);
    assert.equal(getAuthSession().refreshToken, "refresh-old");
    stop();
    const count = scheduled.length;
    browser.dispatchEvent(new Event("focus"));
    browser.dispatchEvent(new Event("online"));
    document.dispatchEvent(new Event("visibilitychange"));
    assert.equal(scheduled.length, count);
    assert.ok(clear.mock.callCount() > 0);
});

test("synchronizes another tab's rotation and logout via storage events", (t) => {
    let stop = () => {};
    t.after(() => stop());
    const browser = new EventTarget();
    replaceGlobal(t, "window", browser);
    replaceGlobal(t, "document", new EventTarget());
    setAuthSession(session());
    stop = maintainAuthSession();
    const event = new Event("storage");
    Object.defineProperty(event, "key", { value: AUTH_STORAGE_KEY });
    saveAuthSession(session({ accessToken: "tab-access", refreshToken: "tab-refresh" }));
    browser.dispatchEvent(event);
    assert.equal(getAuthSession().refreshToken, "tab-refresh");
    localStorage.removeItem(AUTH_STORAGE_KEY);
    browser.dispatchEvent(event);
    assert.equal(getAuthSession(), null);
});
