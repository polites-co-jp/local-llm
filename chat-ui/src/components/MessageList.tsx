"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/lib/api";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Send a message to start chatting
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[80%] rounded-2xl px-4 py-3 whitespace-pre-wrap break-words ${
              msg.role === "user"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-100"
            }`}
          >
            {msg.content}
            {isLoading &&
              msg.role === "assistant" &&
              i === messages.length - 1 && (
                <span className="inline-block w-2 h-4 ml-1 bg-gray-300 animate-pulse rounded-sm" />
              )}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
