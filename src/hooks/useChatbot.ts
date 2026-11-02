import { useState, useCallback, useRef, useEffect } from "react";
import type { ChatMessage, ChatRequest } from "../types/chatbot";
import { sendMessage } from "../services/chatbot.service";

/** Tempo máximo de espera por uma resposta do assistente (ms). */
const CHAT_TIMEOUT_MS = 90_000;

export interface UseChatbotResult {
    isOpen: boolean;
    messages: ChatMessage[];
    loading: boolean;
    error: string | null;
    inputValue: string;
    open: () => void;
    close: () => void;
    toggle: () => void;
    setInputValue: (value: string) => void;
    sendQuestion: (text?: string) => void;
    clearError: () => void;
}

export function useChatbot(): UseChatbotResult {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [inputValue, setInputValue] = useState("");

    const sessionIdRef = useRef<string | null>(null);
    const controllerRef = useRef<AbortController | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            controllerRef.current?.abort();
            if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
        };
    }, []);

    const open = useCallback((): void => setIsOpen(true), []);
    const close = useCallback((): void => setIsOpen(false), []);
    const toggle = useCallback((): void => setIsOpen((prev) => !prev), []);
    const clearError = useCallback((): void => setError(null), []);

    const sendQuestion = useCallback((text?: string): void => {
        const question = (text ?? inputValue).trim();
        if (!question || loading) return;

        setInputValue("");
        setError(null);

        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: question,
        };
        setMessages((prev) => [...prev, userMessage]);
        setLoading(true);

        controllerRef.current?.abort();
        if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);

        const controller = new AbortController();
        controllerRef.current = controller;

        // Aborta automaticamente após CHAT_TIMEOUT_MS se não houver resposta.
        let timedOut = false;
        timeoutRef.current = setTimeout(() => {
            timedOut = true;
            controller.abort();
        }, CHAT_TIMEOUT_MS);

        const request: ChatRequest = {
            question,
            session_id: sessionIdRef.current ?? undefined,
        };

        sendMessage(request, { signal: controller.signal })
            .then((response) => {
                if (!mountedRef.current || controller.signal.aborted) return;
                sessionIdRef.current = response.session_id;
                const assistantMessage: ChatMessage = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: response.answer,
                };
                setMessages((prev) => [...prev, assistantMessage]);
            })
            .catch((err: unknown) => {
                if (!mountedRef.current) return;
                if (timedOut) {
                    setError("O assistente demorou demais para responder. Tente novamente em instantes.");
                    return;
                }
                if (controller.signal.aborted) return;
                setError(err instanceof Error ? err.message : "Erro ao comunicar com o assistente.");
            })
            .finally(() => {
                if (timeoutRef.current !== null) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }
                if (mountedRef.current) {
                    setLoading(false);
                }
            });
    }, [inputValue, loading]);

    return {
        isOpen,
        messages,
        loading,
        error,
        inputValue,
        open,
        close,
        toggle,
        setInputValue,
        sendQuestion,
        clearError,
    };
}
