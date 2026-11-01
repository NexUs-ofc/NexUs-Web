const MASK_DIGIT_TOKEN = "#";

export const CNPJ_MASK = "##.###.###/####-##";

export const PHONE_MASK = "(##) #####-####";

export function applyPatternMask(value: string, pattern: string): string {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 0) {
        return "";
    }
    let result = "";
    let digitIndex = 0;
    for (let position = 0; position < pattern.length; position += 1) {
        const patternChar = pattern[position];
        if (patternChar === MASK_DIGIT_TOKEN) {
            if (digitIndex >= digits.length) {
                break;
            }
            result += digits[digitIndex];
            digitIndex += 1;
            continue;
        }
        const hasDigitSlotsAhead = pattern.slice(position + 1).includes(MASK_DIGIT_TOKEN);
        if (!hasDigitSlotsAhead || digitIndex >= digits.length) {
            break;
        }
        result += patternChar;
    }
    return result;
}

export function maskCnpj(value: string): string {
    return applyPatternMask(value, CNPJ_MASK);
}

export function maskPhone(value: string): string {
    return applyPatternMask(value, PHONE_MASK);
}

export function maskEmail(value: string): string {
    const separator = value.lastIndexOf("@");
    if (separator < 1) return "***";
    const localPart = value.slice(0, separator);
    const lastCharacter = localPart.length > 1 ? localPart.slice(-1) : "";
    return `${localPart[0]}***${lastCharacter}${value.slice(separator)}`;
}
