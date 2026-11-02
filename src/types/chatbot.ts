/** Contratos do chatbot Cerita, derivados de app/schemas/api.py (NexUs-BI-AI). */

/** Corpo enviado em POST /chat. */
export interface ChatRequest {
    question: string;
    session_id?: string | null;
    debug?: boolean;
}

/** Resposta de POST /chat. */
export interface ChatResponse {
    session_id: string;
    answer: string;
    route: string;
    steps: string[] | null;
}

/** Resposta de DELETE /chat/{session_id}. */
export interface SessionClosedResponse {
    session_id: string;
    closed: boolean;
}

export type MessageRole = "user" | "assistant";

/** Mensagem exibida na UI do chat. */
export interface ChatMessage {
    id: string;
    role: MessageRole;
    content: string;
}
