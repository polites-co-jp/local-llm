"use client";

import { useState, useCallback } from "react";
import { ModelSelector } from "./ModelSelector";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { sendMessage, type Message } from "@/lib/api";

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = useCallback(
    async (text: string) => {
      if (!selectedModel || isLoading) return;

      const userMessage: Message = { role: "user", content: text };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setIsLoading(true);

      setMessages([...updatedMessages, { role: "assistant", content: "" }]);

      try {
        await sendMessage(selectedModel, updatedMessages, (content) => {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            next[next.length - 1] = { ...last, content: last.content + content };
            return next;
          });
        });
      } catch (e) {
        const errorText =
          e instanceof Error ? e.message : "An error occurred";
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = {
            role: "assistant",
            content: `Error: ${errorText}`,
          };
          return next;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [messages, selectedModel, isLoading]
  );

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <header className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
        <h1 className="text-lg font-semibold text-white">Local LLM Chat</h1>
        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </header>
      <MessageList messages={messages} isLoading={isLoading} />
      <MessageInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
}
