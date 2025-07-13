from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.database.config import engine
from app.models.models import Base
from app.routers import users, questions, answers, votes, tags, search, stats

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="StackIt API",
    description="A minimal Q&A Forum Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Get environment variable for frontend URL
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        FRONTEND_URL,  # Production frontend URL
        "https://*.vercel.app",  # Allow Vercel deployments
        "https://*.netlify.app",  # Allow Netlify deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "StackIt API is running"}

# Include routers
app.include_router(users.router)
app.include_router(questions.router)
app.include_router(answers.router)
app.include_router(votes.router)
app.include_router(tags.router)
app.include_router(search.router)
app.include_router(stats.router) 