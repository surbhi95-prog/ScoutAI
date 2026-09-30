from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
import app.models # registers all models

from app.routers.verification import router as verification_router
# USER AUTHNTICATION ROUTER
from app.routers.auth import router as auth_router

# FOR ADMIN ROLE
from app.routers import admin

# For company table
from app.routers.company import router as company_router

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------ app.include_router(auth_router) # we are saying that all the endpoints inside auth.py are now part of this application.
app.include_router(auth_router) # For User Authentication
app.include_router(verification_router) # we are saying that all the endpoints inside verification.py are now part of this application.
                                        # here we took only verification_router
app.include_router(company_router)
app.include_router(admin.router)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

@app.get("/")
def root():
    return{
        "message":"Welcome to ScoutAP - AI Powered Job Verification System"
    }
# Entry point of our APPLICATION
#  you type the cmd ->
# -> uvi starts a web server ->imports app/main.py
# -> looks for FASTAPI obj named "app" -> server starts to listen the req
