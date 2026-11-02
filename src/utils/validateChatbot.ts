import type { ChatRequest, ChatResponse, SessionClosedResponse } from "../types/chatbot";
import { asRecord } from "./responseParsers";

export const CHAT_QUESTION_MAX_LENGTH = 2000;
export const CHAT_RESPONSE_MAX_LENGTH = 32000;
const SESSION_ID_MAX_LENGTH = 256;
const FORBIDDEN_CONTROLS = /[^\P{Cc}\t\r\n]/u;

function text(value: unknown, max: number, message: string): string {
    if (typeof value !== "string" || value.length > max || !value.trim() || FORBIDDEN_CONTROLS.test(value)) throw new Error(message);
    // Texto continua sendo interpolado em JSX; preserva quebras, Markdown e caracteres literais.
    return value.trim();
}

export function validateChatSessionId(value: unknown): string {
    if (typeof value !== "string" || /\s/u.test(value)) throw new Error("Identificação da conversa inválida.");
    const id = text(value, SESSION_ID_MAX_LENGTH, "Identificação da conversa inválida.");
    return id;
}

export function validateChatRequest(value: ChatRequest): ChatRequest {
    const data = asRecord(value);
    const question = text(data.question, CHAT_QUESTION_MAX_LENGTH, `Digite uma pergunta com até ${CHAT_QUESTION_MAX_LENGTH} caracteres.`);
    if (data.debug !== undefined && typeof data.debug !== "boolean") throw new Error("Opção da conversa inválida.");
    return {
        question,
        ...(data.session_id !== undefined && data.session_id !== null ? { session_id: validateChatSessionId(data.session_id) } : {}),
        ...(typeof data.debug === "boolean" ? { debug: data.debug } : {}),
    };
}

export function parseChatResponse(value: unknown): ChatResponse {
    const data = asRecord(value);
    const message = "O assistente retornou uma resposta inválida. Tente novamente.";
    if (data.steps !== null && (!Array.isArray(data.steps) || data.steps.length > 50)) throw new Error(message);
    return {
        session_id: validateChatSessionId(data.session_id),
        answer: text(data.answer, CHAT_RESPONSE_MAX_LENGTH, message),
        route: text(data.route, 100, message),
        steps: data.steps === null ? null : (data.steps as unknown[]).map((step) => text(step, 2000, message)),
    };
}

export function parseSessionClosedResponse(value: unknown, expectedId: string): SessionClosedResponse {
    const data = asRecord(value);
    const sessionId = validateChatSessionId(data.session_id);
    if (sessionId !== expectedId || typeof data.closed !== "boolean") throw new Error("Não foi possível confirmar o encerramento da conversa.");
    return { session_id: sessionId, closed: data.closed };
}
