const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Model {
  name: string;
  size: number;
  parameter_size: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function fetchModels(): Promise<Model[]> {
  const res = await fetch(`${API_URL}/api/models`);
  if (!res.ok) {
    throw new Error(`Failed to fetch models: ${res.status}`);
  }
  const data = await res.json();
  return data.models;
}

export async function sendMessage(
  model: string,
  messages: Message[],
  onChunk: (content: string, done: boolean) => void
): Promise<void> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, stream: true }),
  });

  if (!res.ok) {
    throw new Error(`Chat request failed: ${res.status}`);
  }

  const reader = res.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(":")) continue;

      const dataPrefix = "data: ";
      const payload = trimmed.startsWith(dataPrefix)
        ? trimmed.slice(dataPrefix.length)
        : trimmed;

      try {
        const parsed = JSON.parse(payload);
        onChunk(parsed.content || "", parsed.done || false);
        if (parsed.done) return;
      } catch {
        // skip unparseable lines
      }
    }
  }
}
