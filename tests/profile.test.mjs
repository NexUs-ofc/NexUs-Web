import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

registerHooks({
    resolve(specifier, context, nextResolve) {
        try {
            return nextResolve(specifier, context);
        } catch (error) {
            if (specifier.startsWith(".") && error.code === "ERR_MODULE_NOT_FOUND") return nextResolve(specifier + ".ts", context);
            throw error;
        }
    },
});
const { maskProfilePhone, toProfilePayload, validateProfileForm, EMPTY_PROFILE_ADDRESS } = await import("../src/utils/validateProfile.ts");

test("máscara limita digitação e colagem nacionais a DDD e onze dígitos", () => {
    assert.equal(maskProfilePhone("119818678999999999"), "(11) 98186-7899");
    let value = "";
    for (const digit of "119818678999999999") value = maskProfilePhone(value + digit);
    assert.equal(value, "(11) 98186-7899");
    assert.equal(maskProfilePhone("1133334444"), "(11) 3333-4444");
});

test("colagem com +55 preserva o número completo antes de limitar os excedentes", () => {
    const phone = maskProfilePhone("+55 (11) 98186-7899 999999");
    assert.equal(phone, "+55 (11) 98186-7899");
    const form = { name: "Empresa", phones: [phone], address: { ...EMPTY_PROFILE_ADDRESS } };
    assert.deepEqual(toProfilePayload(form).phones, ["+5511981867899"]);
    assert.equal(validateProfileForm(form, false).phones[0], "");
});

test("internacionais limitam quinze dígitos e não acumulam pontuação", () => {
    assert.equal(maskProfilePhone("+44 (20) 7946-0958"), "+442079460958");
    assert.equal(maskProfilePhone("+12345678901234567890"), "+123456789012345");
    assert.equal(maskProfilePhone("+44" + " ()-".repeat(100)), "+44");
});

test("editar ou apagar continua possível e números incompletos são rejeitados", () => {
    assert.equal(maskProfilePhone(""), "");
    assert.equal(maskProfilePhone("(11) 98186-789"), "(11) 9818-6789");
    const form = { name: "Empresa", phones: ["(11) 123"], address: { ...EMPTY_PROFILE_ADDRESS } };
    assert.notEqual(validateProfileForm(form, false).phones[0], "");
});
