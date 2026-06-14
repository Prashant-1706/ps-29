from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.init import *
from controllers.contentGatewayController import router as ContentRouter
from controllers.draftsGatewayController import router as DraftRouter

app = FastAPI()

#Enable Cors
origins = ["*"] #if you want to allow request from all then use "*"

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,   
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"]
)

#Register all routes
app.include_router(AuthenticationRouter)
app.include_router(TasksRouter)
app.include_router(ContentRouter)
app.include_router(DraftRouter)

@app.get("/")
def home():
    return "Started...."