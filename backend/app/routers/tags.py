from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database.config import get_db
from app.schemas.schemas import TagResponse, QuestionResponse
from app.services.tag_service import TagService

router = APIRouter(prefix="/api/tags", tags=["tags"])

@router.get("/", response_model=List[TagResponse])
def get_tags(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """Get all tags"""
    tag_service = TagService(db)
    return tag_service.get_all_tags(skip, limit)

@router.get("/popular", response_model=List[TagResponse])
def get_popular_tags(limit: int = 20, db: Session = Depends(get_db)):
    """Get popular tags"""
    tag_service = TagService(db)
    return tag_service.get_popular_tags(limit)

@router.get("/search", response_model=List[TagResponse])
def search_tags(q: str, limit: int = 10, db: Session = Depends(get_db)):
    """Search tags"""
    tag_service = TagService(db)
    return tag_service.search_tags(q, limit)

@router.get("/{tag_name}/questions", response_model=List[QuestionResponse])
def get_questions_by_tag(tag_name: str, skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """Get questions by tag"""
    tag_service = TagService(db)
    return tag_service.get_questions_by_tag(tag_name, skip, limit) 