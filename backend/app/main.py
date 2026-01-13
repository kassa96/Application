from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1 import category_controller, interviewer_controller, video_controller

app = FastAPI()
origins = [
    "http://localhost:4200",  
    "http://127.0.0.1:4200",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],            
    allow_credentials=True,
    allow_methods=["*"],              
    allow_headers=["*"],             
)
app.mount("/static", StaticFiles(directory="app/static"), name="static")
app.include_router(interviewer_controller.router, prefix="/interviewers", tags=["interviewers"])
app.include_router(video_controller.router, prefix="/podcasts", tags=["podcasts"])
app.include_router(category_controller.router, prefix="/categories", tags=["categories"])