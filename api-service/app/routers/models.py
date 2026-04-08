from fastapi import APIRouter, HTTPException
import httpx

from app.services.ollama_client import ollama_client

router = APIRouter()


@router.get("/api/models")
async def get_models() -> dict:
    try:
        data = await ollama_client.list_models()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Ollama request failed: {e}")

    models = []
    for m in data.get("models", []):
        models.append({
            "name": m.get("name", ""),
            "size": m.get("size", 0),
            "parameter_size": m.get("details", {}).get("parameter_size", ""),
        })

    return {"models": models}
