from pydantic import BaseModel
from typing import Optional


# Signup request schema
class SignupSchema(BaseModel):
    fullname: str
    phone: str
    email: str
    password: str


# Signin request schema
class SigninSchema(BaseModel):
    username: str
    password: str


# User creation/update schema
class UsersSchema(BaseModel):
    fullname: str
    phone: str
    email: str
    password: str
    role: int
    status: int


# Task request schema
class TasksSchema(BaseModel):
    title: str
    description: str

    # createdby is optional because ReactJS will not send this field.
    # Node.js will identify the logged-in user from JWT token
    # and automatically add createdby before saving into MongoDB.
    createdby: Optional[int] = None

    assignedto: int
    priority: int
    deadline: str
    status: int


class ContentSchema(BaseModel):
    id: Optional[int] = None
    title: str
    body: str
    author_id: int
    publishedAt: Optional[str] = None
    originalDraftId: Optional[int] = None

class DraftSchema(BaseModel):
    id: Optional[int] = None
    title: str
    body: str
    author_id: int
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None

class ContentVersionSchema(BaseModel):
    contentId: str
    versionNumber: int
    body: str
    editorId: str
    action: str

class SemanticSearchSchema(BaseModel):
    query: str
    threshold: Optional[float] = 0.3