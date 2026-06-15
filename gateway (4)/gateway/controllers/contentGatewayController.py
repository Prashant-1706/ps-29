import os
from fastapi import APIRouter, Header
from models.schemas import ContentSchema, ContentVersionSchema, SemanticSearchSchema
import httpx

router = APIRouter(prefix="/content")

SPRING_URL = os.environ.get("SPRING_URL", "http://localhost:8001/").rstrip("/") + "/"
NODE_URL = os.environ.get("NODE_URL", "http://127.0.0.1:8002/").rstrip("/") + "/"

@router.post("/publish")
async def publishContent(C: ContentSchema, Token: str = Header(...)):
    payload = C.model_dump()
    payload["author"] = {"id": payload.pop("author_id")}
    async with httpx.AsyncClient() as client:
        response = await client.post(
            SPRING_URL + "content/publish",
            json=payload,
            headers={"Token": Token}
        )
    return response.json()

@router.post("/save_version")
async def saveVersion(V: ContentVersionSchema, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            NODE_URL + "content_tracking/save_version",
            json=V.model_dump(),
            headers={"Token": Token}
        )
    return response.json()

@router.post("/semantic_search")
async def semanticSearch(S: SemanticSearchSchema, Token: str = Header(...)):
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            NODE_URL + "content_tracking/semantic_search",
            json=S.model_dump(),
            headers={"Token": Token}
        )
    return response.json()

@router.get("/author/{authorId}")
async def getContentByAuthor(authorId: int, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            SPRING_URL + f"content/author/{authorId}",
            headers={"Token": Token}
        )
    return response.json()

@router.get("/versions/{contentId}")
async def getContentVersions(contentId: str, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            NODE_URL + f"content_tracking/versions/{contentId}",
            headers={"Token": Token}
        )
    return response.json()

@router.delete("/delete/{contentId}")
async def deleteContent(contentId: int, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        # Delete from SQL relational DB
        sql_response = await client.delete(
            SPRING_URL + f"content/delete/{contentId}",
            headers={"Token": Token}
        )
        # Delete from Mongo NoSQL DB
        try:
            await client.delete(
                NODE_URL + f"content_tracking/delete/{contentId}",
                headers={"Token": Token}
            )
        except Exception:
            pass
    return sql_response.json()
