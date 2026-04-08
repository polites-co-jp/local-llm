import json

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
import httpx

from app.services.ollama_client import ollama_client

router = APIRouter()


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    model: str
    messages: list[Message]
    stream: bool = True


@router.post("/api/chat")
async def chat(request: ChatRequest):
    if request.stream:
        return EventSourceResponse(stream_chat(request))

    try:
        data = await ollama_client.chat(
            model=request.model,
            messages=[m.model_dump() for m in request.messages],
        )
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Ollama request failed: {e}")

    return {
        "model": data.get("model", request.model),
        "message": data.get("message", {"role": "assistant", "content": ""}),
    }


async def stream_chat(request: ChatRequest):
    try:
        async for chunk in ollama_client.chat_stream(
            model=request.model,
            messages=[m.model_dump() for m in request.messages],
        ):
            done = chunk.get("done", False)
            content = chunk.get("message", {}).get("content", "")
            yield json.dumps({"content": content, "done": done}, ensure_ascii=False)

            if done:
                break
    except httpx.HTTPError as e:
        yield json.dumps({"error": str(e), "done": True})
