from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any

from app.database.config import get_db
from app.models.models import User, Question, Answer, Vote, Tag
from app.dependencies.auth import optional_auth

router = APIRouter(prefix="/api/stats", tags=["stats"])

@router.get("/")
def get_stats(
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(optional_auth)
):
    """Get general statistics"""
    
    # Count totals
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_questions = db.query(func.count(Question.id)).scalar() or 0
    total_answers = db.query(func.count(Answer.id)).scalar() or 0
    total_votes = db.query(func.count(Vote.id)).scalar() or 0
    total_tags = db.query(func.count(Tag.id)).scalar() or 0
    
    # Count solved questions
    solved_questions = db.query(func.count(Question.id)).filter(Question.is_solved == True).scalar() or 0
    
    return {
        "total_users": total_users,
        "total_questions": total_questions,
        "total_answers": total_answers,
        "total_votes": total_votes,
        "total_tags": total_tags,
        "solved_questions": solved_questions
    }

@router.get("/users/top")
def get_top_users(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(optional_auth)
):
    """Get top users by reputation"""
    users = db.query(User).order_by(User.reputation.desc()).limit(limit).all()
    return users

@router.get("/questions/top")
def get_top_questions(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(optional_auth)
):
    """Get top questions by votes"""
    questions = db.query(Question).order_by(Question.vote_count.desc()).limit(limit).all()
    return questions 