from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from app.database.config import get_db
from app.schemas.schemas import AnswerCreate, AnswerUpdate, AnswerResponse, MessageResponse
from app.services.answer_service import AnswerService
from app.dependencies.auth import require_auth

router = APIRouter(prefix="/api/answers", tags=["answers"])

@router.post("/", response_model=AnswerResponse)
def create_answer(
    answer_data: AnswerCreate, 
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_auth)
):
    """Create a new answer"""
    user_id = current_user['local_user'].id
    answer_service = AnswerService(db)
    
    answer = answer_service.create_answer(answer_data, user_id)
    
    if not answer:
        raise HTTPException(status_code=400, detail="Failed to create answer")
    
    return answer

@router.get("/question/{question_id}", response_model=List[AnswerResponse])
def get_question_answers(question_id: str, db: Session = Depends(get_db)):
    """Get all answers for a question"""
    answer_service = AnswerService(db)
    return answer_service.get_answers_by_question(question_id)

@router.put("/{answer_id}", response_model=AnswerResponse)
def update_answer(
    answer_id: str, 
    answer_data: AnswerUpdate, 
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_auth)
):
    """Update an answer"""
    user_id = current_user['local_user'].id
    answer_service = AnswerService(db)
    
    answer = answer_service.update_answer(answer_id, answer_data, user_id)
    
    if not answer:
        raise HTTPException(status_code=404, detail="Answer not found or unauthorized")
    
    return answer

@router.delete("/{answer_id}")
def delete_answer(
    answer_id: str, 
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_auth)
):
    """Delete an answer"""
    user_id = current_user['local_user'].id
    answer_service = AnswerService(db)
    
    if not answer_service.delete_answer(answer_id, user_id):
        raise HTTPException(status_code=404, detail="Answer not found or unauthorized")
    
    return MessageResponse(message="Answer deleted successfully")

@router.post("/{answer_id}/accept", response_model=MessageResponse)
def accept_answer(
    answer_id: str, 
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_auth)
):
    """Accept an answer as the solution"""
    user_id = current_user['local_user'].id
    answer_service = AnswerService(db)
    
    if not answer_service.accept_answer(answer_id, user_id):
        raise HTTPException(status_code=404, detail="Answer not found or unauthorized")
    
    return MessageResponse(message="Answer accepted successfully")