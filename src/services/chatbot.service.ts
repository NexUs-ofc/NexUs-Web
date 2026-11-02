/**
 * Funções de acesso aos endpoints do chatbot Cerita.
 *
 * Contratos (app/controller/chat_controller.py + app/schemas/api.py):
 *   POST   /chat                  → envia pergunta, recebe resposta
 *   DELETE /chat/{session_id}     → encerra a conversa e libera memória
 */
import type { ChatRequest, ChatResponse, SessionClosedResponse } from "../types/chatbot";
import { chatbotRequest, describeChatbotError } from "./chatbotClient";
import { ApiError } from "./apiError";
import { parseChatResponse, parseSessionClosedResponse, validateChatRequest, validateChatSessionId } from "../utils/validateChatbot";

export interface ChatbotServiceOptions {
    signal?: AbortSignal;
}

/** Envia uma pergunta para o chatbot e retorna a resposta gerada. */
export async function sendMessage(
    request: ChatRequest,
    options: ChatbotServiceOptions = {},
): Promise<ChatResponse> {
    const payload = validateChatRequest(request);
    try {
        return parseChatResponse(await chatbotRequest<unknown>("/chat", {
            method: "POST",
            body: payload,
            timeoutMs: 90_000,
            ...(options.signal ? { signal: options.signal } : {}),
        }));
    } catch (error) {
        if (options.signal?.aborted) throw error;
        throw new Error(
            error instanceof ApiError ? describeChatbotError(error, "Não foi possível enviar a mensagem. Tente novamente.")
                : error instanceof Error ? error.message : "O assistente retornou uma resposta inválida. Tente novamente.",
            { cause: error },
        );
    }
}

/** Encerra a sessão de conversa no servidor, limpando o histórico em memória. */
export async function closeSession(
    sessionId: string,
    options: ChatbotServiceOptions = {},
): Promise<SessionClosedResponse> {
    const validatedId = validateChatSessionId(sessionId);
    try {
        return parseSessionClosedResponse(await chatbotRequest<unknown>(
            `/chat/${encodeURIComponent(validatedId)}`,
            {
                method: "DELETE",
                ...(options.signal ? { signal: options.signal } : {}),
            },
        ), validatedId);
    } catch (error) {
        if (options.signal?.aborted) throw error;
        throw new Error(
            describeChatbotError(error, "Não foi possível encerrar a sessão."),
            { cause: error },
        );
    }
}
