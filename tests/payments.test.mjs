import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

const coreUrl = new URL("../src/services/coreClient.ts", import.meta.url).href;

registerHooks({
    resolve(specifier, context, nextResolve) {
        try {
            return nextResolve(specifier, context);
        } catch (error) {
            if (specifier.startsWith(".") && error.code === "ERR_MODULE_NOT_FOUND") return nextResolve(specifier + ".ts", context);
            throw error;
        }
    },
    load(url, context, nextLoad) {
        if (url !== coreUrl) return nextLoad(url, context);
        return {
            format: "module",
            shortCircuit: true,
            source: [
                "export const requests = [];",
                "let responder = () => undefined;",
                "export function respondWith(value) { requests.length = 0; responder = value; }",
                "export async function coreRequest(endpoint, options) { requests.push({ endpoint, options }); return responder(endpoint, options); }",
            ].join("\n"),
        };
    },
});

const { toValidatedPayment, toValidatedPayments } = await import("../src/utils/validatePayments.ts");
const { filterPayments, summarizePayments, isOverduePayment, formatPaymentPeriod, formatPaymentDate } = await import("../src/utils/paymentFilters.ts");
const { getPayments, getPayment, payPayment } = await import("../src/services/payments.service.ts");
const { requests, respondWith } = await import(coreUrl);

function response(overrides = {}) {
    return {
        id: 1,
        companyId: 10,
        planId: 21,
        amount: 359.99,
        dueDate: "2026-11-10",
        billingPeriodStart: "2026-11-01",
        billingPeriodEnd: "2026-11-30",
        paymentStatus: "PENDING",
        paidAt: null,
        ...overrides,
    };
}

test("preserves the historical plan and charged amount independently of the current plan", () => {
    const payment = toValidatedPayment(response({ planId: 22, amount: 629.9 }));
    assert.equal(payment.planId, 22);
    assert.equal(payment.amount, 629.9);
    assert.equal(payment.status, "PENDING");
});

test("rejects invalid identifiers, amounts, statuses and calendar dates", () => {
    for (const invalid of [
        { id: 0 }, { companyId: -1 }, { planId: 1.2 }, { amount: "359.99" },
        { amount: -1 }, { amount: NaN }, { amount: 1.001 }, { amount: Infinity },
        { paymentStatus: "UNKNOWN" }, { dueDate: "2026-02-30" }, { dueDate: "2026-13-01" },
        { billingPeriodEnd: "2026-10-31" }, { paidAt: "2026-11-01T24:00:00" },
    ]) assert.throws(() => toValidatedPayment(response(invalid)), JSON.stringify(invalid));
    assert.equal(toValidatedPayment(response({ amount: 0 })).amount, 0);
    assert.equal(toValidatedPayment(response({ paidAt: "2026-11-01T08:09:10.123456789" })).paidAt, "2026-11-01T08:09:10.123456789");
});

test("rejects malformed lists and duplicate charges and sorts by due date", () => {
    assert.throws(() => toValidatedPayments({ payments: [] }));
    assert.throws(() => toValidatedPayments([response(), response()]));
    assert.deepEqual(toValidatedPayments([response(), response({ id: 2, dueDate: "2026-12-10" })]).map((payment) => payment.id), [2, 1]);
    assert.deepEqual(toValidatedPayments([]), []);
});

test("pending includes overdue payments while cancelled charges cannot enter pending or paid", () => {
    const payments = ["PENDING", "OVERDUE", "PAID", "CANCELLED"].map((paymentStatus, index) => toValidatedPayment(response({ id: index + 1, paymentStatus })));
    assert.deepEqual(filterPayments(payments, "pending").map((payment) => payment.id), [1, 2]);
    assert.deepEqual(filterPayments(payments, "paid").map((payment) => payment.id), [3]);
    assert.equal(filterPayments(payments, "all").length, 4);
    const summary = summarizePayments(payments);
    assert.equal(summary.pendingCount, 2);
    assert.equal(summary.pendingAmount, 719.98);
    assert.equal(summary.paidCount, 1);
    assert.equal(summary.paidAmount, 359.99);
});

test("calculates totals in cents and updates pending, paid and the next due date after payment", () => {
    const pending = toValidatedPayment(response({ amount: 0.1 }));
    const overdue = toValidatedPayment(response({ id: 2, amount: 0.2, dueDate: "2026-10-10", paymentStatus: "OVERDUE" }));
    const summary = summarizePayments([pending, overdue]);
    assert.equal(summary.pendingAmount, 0.3);
    assert.equal(summary.nextPayment.id, 2);
    const paid = [pending, overdue].map((payment) => ({ ...payment, status: "PAID" }));
    assert.equal(summarizePayments(paid).pendingAmount, 0);
    assert.equal(summarizePayments(paid).paidAmount, 0.3);
    assert.equal(summarizePayments(paid).nextPayment, null);
    assert.equal(summarizePayments([]).total, 0);
});

test("formats the billing period instead of assuming the due date is the reference month", () => {
    const payment = toValidatedPayment(response({ billingPeriodStart: "2026-10-01", billingPeriodEnd: "2026-10-31" }));
    assert.equal(formatPaymentPeriod(payment), "outubro de 2026");
    assert.equal(formatPaymentDate("2026-11-01T00:05:00"), "01/11/2026");
    assert.equal(formatPaymentPeriod({ ...payment, billingPeriodEnd: "2026-11-01" }), "01/10/2026 a 01/11/2026");
    assert.equal(isOverduePayment(payment, new Date(2026, 10, 11)), true);
    assert.equal(isOverduePayment(payment, new Date(2026, 10, 10)), false);
    assert.equal(isOverduePayment({ ...payment, status: "PAID" }, new Date(2026, 10, 11)), false);
});

test("calls Core listing and detail routes with cancellation support", async () => {
    const signal = new AbortController().signal;
    respondWith(() => [response()]);
    assert.equal((await getPayments({ status: "PENDING", signal })).length, 1);
    assert.equal(requests[0].endpoint, "/api/companies/me/payments?status=PENDING");
    assert.equal(requests[0].options.signal, signal);
    respondWith(() => response());
    await getPayment(1, { signal });
    assert.equal(requests[0].endpoint, "/api/companies/me/payments/1");
    assert.equal(requests[0].options.signal, signal);
    respondWith(() => response({ id: 2 }));
    await assert.rejects(() => getPayment(1), /diferente/u);
});

test("only confirms a payment after POST returns the same charge as PAID", async () => {
    respondWith(() => response({ paymentStatus: "PAID", paidAt: "2026-11-01T12:00:00" }));
    assert.equal((await payPayment(1)).status, "PAID");
    assert.equal(requests[0].endpoint, "/api/companies/me/payments/1/pay");
    assert.equal(requests[0].options.method, "POST");
    assert.equal(requests[0].options.body, undefined);
    respondWith(() => response());
    await assert.rejects(() => payPayment(1), /confirmar/u);
    respondWith(() => response({ id: 2, paymentStatus: "PAID" }));
    await assert.rejects(() => payPayment(1), /confirmar/u);
    respondWith(() => { throw new Error("Servidor indisponível"); });
    await assert.rejects(() => payPayment(1), /Servidor indisponível/u);
    respondWith(() => response());
    await assert.rejects(() => payPayment(0), /Identificador/u);
    assert.equal(requests.length, 0);
});
