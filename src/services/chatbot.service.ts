/**
 * Funções de acesso aos endpoints do chatbot Cerita.
 *
 * Contratos (app/controller/chat_controller.py + app/schemas/api.py):
 *   POST   /chat                  → envia pergunta, recebe resposta
 *   DELETE /chat/{session_id}     → encerra a conversa e libera memória
 */
import type { ChatRequest, ChatResponse, SessionClosedResponse } from "../types/chatbot";
import { chatbotRequest, describeChatbotError } from "./chatbotClient";

export interface ChatbotServiceOptions {
    signal?: AbortSignal;
}

/** Envia uma pergunta para o chatbot e retorna a resposta gerada. */
export async function sendMessage(
    request: ChatRequest,
    options: ChatbotServiceOptions = {},
): Promise<ChatResponse> {
    try {
        return await chatbotRequest<ChatResponse>("/chat", {
            method: "POST",
            body: request,
            ...(options.signal ? { signal: options.signal } : {}),
        });
    } catch (error) {
        if (options.signal?.aborted) throw error;
        throw new Error(
            describeChatbotError(error, "Não foi possível enviar a mensagem. Tente novamente."),
            { cause: error },
        );
    }
}

/** Encerra a sessão de conversa no servidor, limpando o histórico em memória. */
export async function closeSession(
    sessionId: string,
    options: ChatbotServiceOptions = {},
): Promise<SessionClosedResponse> {
    try {
        return await chatbotRequest<SessionClosedResponse>(
            `/chat/${encodeURIComponent(sessionId)}`,
            {
                method: "DELETE",
                ...(options.signal ? { signal: options.signal } : {}),
            },
        );
    } catch (error) {
        if (options.signal?.aborted) throw error;
        throw new Error(
            describeChatbotError(error, "Não foi possível encerrar a sessão."),
            { cause: error },
        );
    }
}
