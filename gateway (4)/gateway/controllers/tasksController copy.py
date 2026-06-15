import os
from fastapi import APIRouter, Header
from models.schemas import TasksSchema
import httpx

router = APIRouter(prefix="/taskservice")

NODE_URL = os.environ.get("NODE_URL", "http://127.0.0.1:8002/").rstrip("/") + "/"

@router.post("/createtask")
async def createTask(T: TasksSchema, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            NODE_URL + "task/createtask",
            json=T.model_dump(),
            headers = {"Token": Token}
        )
    return response.json()

@router.get("/getalltasks/{PAGE}/{SIZE}")
async def getAllTasks(PAGE: int, SIZE:int, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            NODE_URL + f"task/getalltasks/{PAGE}/{SIZE}",
            headers = {"Token": Token}
        )
    return response.json()

@router.get("/vectorsearch/{KEY}")
async def vectorSearch(KEY: str, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            NODE_URL + f"task/vectorsearch/{KEY}",
            headers = {"Token": Token}
        )
    return response.json()

@router.get("/gettask/{ID}")
async def vectorSearch(ID: str, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            NODE_URL + f"task/gettask/{ID}",
            headers = {"Token": Token}
        )
    return response.json()

@router.put("/updatetask/{ID}")
async def vectorSearch(ID: str, data: TasksSchema, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.put(
            NODE_URL + f"task/updatetask/{ID}",
            json=data.model_dump(),
            headers = {"Token": Token}
        )
    return response.json()

@router.delete("/deletetask/{ID}")
async def vectorSearch(ID: str, Token: str = Header(...)):
    async with httpx.AsyncClient() as client:
        response = await client.delete(
            NODE_URL + f"task/deletetask/{ID}",
            headers = {"Token": Token}
        )
    return response.json()