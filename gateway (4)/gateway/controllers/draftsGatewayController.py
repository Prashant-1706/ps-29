import os
from fastapi import APIRouter, Header
from models.schemas import DraftSchema
import httpx

router = APIRouter(prefix="/draft")

SPRING_URL = os.environ.get("SPRING_URL", "http://localhost:8001/").rstrip("/") + "/"
NODE_URL = os.environ.get("NODE_URL", "http://127.0.0.1:8002/").rstrip("/") + "/"

@router.post("/save")
async def saveDraft(D: DraftSchema, Token: str = Header(...)):
    payload = D.model_dump()
    payload["author"] = {"id": payload.pop("author_id")}
    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPRING_URL + "draft/save",
            json=payload,
            headers={"Token": Token}
        )
    return response.json()

@router.get("/author/{authorId}")
async def getDraftsByAuthor(authorId: int, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            SPRING_URL + f"draft/author/{authorId}",
            headers={"Token": Token}
        )
    return response.json()

@router.delete("/delete/{draftId}")
async def deleteDraft(draftId: int, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        # Delete from SQL relational DB
        sql_response = await client.delete(
            SPRING_URL + f"draft/delete/{draftId}",
            headers={"Token": Token}
        )
        # Delete from Mongo NoSQL DB
        try:
            await client.delete(
                NODE_URL + f"content_tracking/delete/{draftId}",
                headers={"Token": Token}
            )
        except Exception:
            pass
    return sql_response.json()
