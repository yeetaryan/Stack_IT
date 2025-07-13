from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database.config import get_db
from app.schemas.schemas import VoteCreate, MessageResponse
from app.services.vote_service import VoteService
from app.dependencies.auth import require_auth

router = APIRouter(prefix="/api/votes", tags=["votes"])

@router.post("/")
def create_vote(
    vote: VoteCreate, 
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(require_auth)
):
    """Create or update a vote"""
    user_id = current_user['local_user'].id  # Use authenticated user
    vote_service = VoteService(db)
    result = vote_service.vote(vote, user_id)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    # Return the full result instead of just MessageResponse
    return result

@router.get("/question/{question_id}")
def get_question_votes(question_id: str, db: Session = Depends(get_db)):
    """Get vote statistics for a question"""
    vote_service = VoteService(db)
    return vote_service.get_question_votes(question_id)

@router.get("/answer/{answer_id}")
def get_answer_votes(answer_id: str, db: Session = Depends(get_db)):
    """Get vote statistics for an answer"""
    vote_service = VoteService(db)
    return vote_service.get_answer_votes(answer_id)