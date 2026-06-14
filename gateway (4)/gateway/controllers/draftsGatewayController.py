from fastapi import APIRouter, Header
from models.schemas import DraftSchema
import httpx

router = APIRouter(prefix="/draft")

SPRING_URL = "http://localhost:8001/"

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
