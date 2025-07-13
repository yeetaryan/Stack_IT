from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database.config import get_db
from app.schemas.schemas import QuestionResponse
from app.services.question_service import QuestionService

router = APIRouter(prefix="/api/search", tags=["search"])

@router.get("/questions", response_model=List[QuestionResponse])
def search_questions(q: str, limit: int = 10, db: Session = Depends(get_db)):
    """Search questions"""
    question_service = QuestionService(db)
    return question_service.search_questions(q, limit) 