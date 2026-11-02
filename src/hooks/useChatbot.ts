import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatMessage, ChatRequest } from "../types/chatbot";
import { sendMessage } from "../services/chatbot.service";
import { validateChatRequest } from "../utils/validateChatbot";

interface ChatbotState {
    isOpen: boolean;
    messages: ChatMessage[];
    loading: boolean;
    error: string | null;
    inputValue: string;
}

export interface UseChatbotResult extends ChatbotState {
    open: () => void;
    close: () => void;
    toggle: () => void;
    setInputValue: (value: string) => void;
    sendQuestion: (text?: string) => void;
}

export function useChatbot(): UseChatbotResult {
    const [state, setState] = useState<ChatbotState>({ isOpen: false, messages: [], loading: false, error: null, inputValue: "" });
    const sessionIdRef = useRef<string | null>(null);
    const controllerRef = useRef<AbortController | null>(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            controllerRef.current?.abort();
        };
    }, []);

    const open = useCallback((): void => setState((previous) => ({ ...previous, isOpen: true })), []);
    const close = useCallback((): void => setState((previous) => ({ ...previous, isOpen: false })), []);
    const toggle = useCallback((): void => setState((previous) => ({ ...previous, isOpen: !previous.isOpen })), []);
    const setInputValue = useCallback((inputValue: string): void => setState((previous) => ({ ...previous, inputValue })), []);

    const sendQuestion = useCallback((text?: string): void => {
        if (controllerRef.current !== null || !mountedRef.current) return;
        let request: ChatRequest;
        try {
            request = validateChatRequest({ question: text ?? state.inputValue, session_id: sessionIdRef.current });
        } catch (error) {
            setState((previous) => ({ ...previous, error: error instanceof Error ? error.message : "Pergunta inválida." }));
            return;
        }

        const controller = new AbortController();
        controllerRef.current = controller;
        const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: request.question };
        setState((previous) => ({ ...previous, inputValue: "", error: null, loading: true, messages: [...previous.messages, userMessage] }));

        void sendMessage(request, { signal: controller.signal }).then((response) => {
            if (!mountedRef.current || controller.signal.aborted) return;
            sessionIdRef.current = response.session_id;
            const message: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: response.answer };
            setState((previous) => ({ ...previous, messages: [...previous.messages, message] }));
        }).catch((error: unknown) => {
            if (!mountedRef.current || controller.signal.aborted) return;
            setState((previous) => ({ ...previous, inputValue: request.question,
                error: error instanceof Error ? error.message : "Erro ao comunicar com o assistente." }));
        }).finally(() => {
            if (controllerRef.current !== controller) return;
            controllerRef.current = null;
            if (mountedRef.current) setState((previous) => ({ ...previous, loading: false }));
        });
    }, [state.inputValue]);

    return { ...state, open, close, toggle, setInputValue, sendQuestion };
}
