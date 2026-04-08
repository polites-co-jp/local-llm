import os
import json
from typing import AsyncGenerator

import httpx

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://llm-engine:11434")


class OllamaClient:
    def __init__(self) -> None:
        self.base_url = OLLAMA_BASE_URL
        self.client = httpx.AsyncClient(base_url=self.base_url, timeout=120.0)

    async def list_models(self) -> dict:
        response = await self.client.get("/api/tags")
        response.raise_for_status()
        return response.json()

    async def chat(self, model: str, messages: list[dict], stream: bool = False) -> dict:
        response = await self.client.post(
            "/api/chat",
            json={"model": model, "messages": messages, "stream": False},
        )
        response.raise_for_status()
        return response.json()

    async def chat_stream(self, model: str, messages: list[dict]) -> AsyncGenerator[dict, None]:
        async with self.client.stream(
            "POST",
            "/api/chat",
            json={"model": model, "messages": messages, "stream": True},
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                if not line:
                    continue
                chunk = json.loads(line)
                yield chunk

    async def close(self) -> None:
        await self.client.aclose()


ollama_client = OllamaClient()
