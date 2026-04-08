"use client";

import { useRef, useCallback, type KeyboardEvent, type ChangeEvent } from "react";

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, []);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    adjustHeight();
  };

  const handleSend = () => {
    const text = textareaRef.current?.value.trim();
    if (!text) return;
    onSend(text);
    if (textareaRef.current) {
      textareaRef.current.value = "";
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled) handleSend();
    }
  };

  return (
    <div className="border-t border-gray-700 p-4">
      <div className="flex items-end gap-3 max-w-4xl mx-auto">
        <textarea
          ref={textareaRef}
          rows={1}
          placeholder="Type a message..."
          disabled={disabled}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="flex-1 resize-none bg-gray-800 text-white border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 placeholder-gray-400"
        />
        <button
          onClick={handleSend}
          disabled={disabled}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-5 py-3 font-medium transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
}
