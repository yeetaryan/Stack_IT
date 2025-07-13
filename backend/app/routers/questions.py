from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.database.config import get_db
from app.schemas.schemas import (
    QuestionCreate, QuestionUpdate, QuestionResponse, QuestionWithAnswers,
    MessageResponse
)
from app.services.question_service import QuestionService
from app.dependencies.auth import require_auth, optional_auth

router = APIRouter(prefix="/api/questions", tags=["questions"])

@router.post("/", response_model=QuestionResponse)
def create_question(
    question: QuestionCreate, 
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_auth)
):
    """Create a new question"""
    user_id = current_user['local_user'].id
    question_service = QuestionService(db)
    return question_service.create_question(question, user_id)

@router.get("/{question_id}", response_model=QuestionWithAnswers)
def get_question(
    question_id: str, 
    db: Session = Depends(get_db),
    current_user: Optional[Dict[str, Any]] = Depends(optional_auth)
):
    """Get question by ID with answers"""
    question_service = QuestionService(db)
    question = question_service.get_question_by_id(question_id)
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Increment view count
    question_service.increment_views(question_id)
    
    return question

@router.put("/{question_id}", response_model=QuestionResponse)
def update_question(
    question_id: str, 
    question_update: QuestionUpdate, 
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_auth)
):
    """Update a question"""
    user_id = current_user['local_user'].id
    question_service = QuestionService(db)
    question = question_service.update_question(question_id, question_update, user_id)
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found or unauthorized")
    
    return question

@router.delete("/{question_id}", response_model=MessageResponse)
def delete_question(
    question_id: str, 
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_auth)
):
    """Delete a question"""
    user_id = current_user['local_user'].id
    question_service = QuestionService(db)
    
    if not question_service.delete_question(question_id, user_id):
        raise HTTPException(status_code=404, detail="Question not found or unauthorized")
    
    return MessageResponse(message="Question deleted successfully")

@router.get("/", response_model=List[QuestionResponse])
def get_questions(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: Optional[Dict[str, Any]] = Depends(optional_auth)
):
    """Get questions with pagination"""
    question_service = QuestionService(db)
    return question_service.get_recent_questions(limit)

@router.get("/user/{user_id}", response_model=List[QuestionResponse])
def get_user_questions(
    user_id: str, 
    skip: int = 0, 
    limit: int = 10, 
    db: Session = Depends(get_db),
    current_user: Optional[Dict[str, Any]] = Depends(optional_auth)
):
    """Get questions by a specific user"""
    question_service = QuestionService(db)
    return question_service.get_user_questions(user_id, skip, limit)

@router.post("/{question_id}/solve", response_model=MessageResponse)
def mark_question_solved(
    question_id: str, 
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_auth)
):
    """Mark question as solved"""
    user_id = current_user['local_user'].id
    question_service = QuestionService(db)
    
    if not question_service.mark_as_solved(question_id, user_id):
        raise HTTPException(status_code=404, detail="Question not found or unauthorized")
    
    return MessageResponse(message="Question marked as solved")

@router.get("/me/questions", response_model=List[QuestionResponse])
def get_my_questions(
    skip: int = 0, 
    limit: int = 10, 
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_auth)
):
    """Get current user's questions"""
    user_id = current_user['local_user'].id
    question_service = QuestionService(db)
    return question_service.get_user_questions(user_id, skip, limit) 