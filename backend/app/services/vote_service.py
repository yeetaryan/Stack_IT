from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import Vote, Question, Answer, User
from app.schemas.schemas import VoteCreate
from typing import Optional, Dict
from app.services.user_service import UserService

class VoteService:
    def __init__(self, db: Session):
        self.db = db
        self.user_service = UserService(db)

    def vote(self, vote_data: VoteCreate, user_id: str) -> Dict[str, any]:
        """Create or update a vote"""
        if not vote_data.question_id and not vote_data.answer_id:
            return {"success": False, "message": "Either question_id or answer_id is required"}
        
        if vote_data.question_id and vote_data.answer_id:
            return {"success": False, "message": "Cannot vote on both question and answer simultaneously"}
        
        # Check if vote already exists
        existing_vote = None
        if vote_data.question_id:
            existing_vote = self.db.query(Vote).filter(
                Vote.user_id == user_id,
                Vote.question_id == vote_data.question_id
            ).first()
        else:
            existing_vote = self.db.query(Vote).filter(
                Vote.user_id == user_id,
                Vote.answer_id == vote_data.answer_id
            ).first()
        
        target_obj = None
        target_owner_id = None
        
        if vote_data.question_id:
            target_obj = self.db.query(Question).filter(Question.id == vote_data.question_id).first()
            target_owner_id = target_obj.user_id if target_obj else None
        else:
            target_obj = self.db.query(Answer).filter(Answer.id == vote_data.answer_id).first()
            target_owner_id = target_obj.user_id if target_obj else None
        
        if not target_obj:
            return {"success": False, "message": "Target not found"}
        
        # Don't allow voting on own content
        if target_owner_id == user_id:
            return {"success": False, "message": "Cannot vote on your own content"}
        
        old_vote_type = 0
        if existing_vote:
            old_vote_type = existing_vote.vote_type
            
            # If same vote type, remove the vote (toggle)
            if existing_vote.vote_type == vote_data.vote_type:
                self.db.delete(existing_vote)
                self._update_vote_count(target_obj, -vote_data.vote_type)
                self._update_user_reputation(target_owner_id, -self._get_reputation_change(vote_data.vote_type))
                self.db.commit()
                return {
                    "success": True, 
                    "message": "Vote removed", 
                    "vote_type": 0,
                    "total_votes": target_obj.vote_count
                }
            else:
                # Update existing vote
                existing_vote.vote_type = vote_data.vote_type
        else:
            # Create new vote
            new_vote = Vote(**vote_data.model_dump(), user_id=user_id)
            self.db.add(new_vote)
        
        # Update vote count
        vote_change = vote_data.vote_type - old_vote_type
        self._update_vote_count(target_obj, vote_change)
        
        # Update user reputation
        reputation_change = self._get_reputation_change(vote_data.vote_type) - self._get_reputation_change(old_vote_type)
        self._update_user_reputation(target_owner_id, reputation_change)
        
        self.db.commit()
        return {
            "success": True, 
            "message": "Vote recorded", 
            "vote_type": vote_data.vote_type,
            "total_votes": target_obj.vote_count
        }

    def get_user_vote(self, user_id: str, question_id: str = None, answer_id: str = None) -> Optional[Vote]:
        """Get user's vote on a question or answer"""
        if question_id:
            return self.db.query(Vote).filter(
                Vote.user_id == user_id,
                Vote.question_id == question_id
            ).first()
        elif answer_id:
            return self.db.query(Vote).filter(
                Vote.user_id == user_id,
                Vote.answer_id == answer_id
            ).first()
        return None

    def get_votes_by_user(self, user_id: str, skip: int = 0, limit: int = 10) -> list:
        """Get all votes by a user"""
        return self.db.query(Vote).filter(Vote.user_id == user_id).offset(skip).limit(limit).all()

    def get_question_votes(self, question_id: str) -> Dict[str, int]:
        """Get vote statistics for a question"""
        upvotes = self.db.query(func.count(Vote.id)).filter(
            Vote.question_id == question_id,
            Vote.vote_type == 1
        ).scalar()
        
        downvotes = self.db.query(func.count(Vote.id)).filter(
            Vote.question_id == question_id,
            Vote.vote_type == -1
        ).scalar()
        
        return {
            "upvotes": upvotes or 0,
            "downvotes": downvotes or 0,
            "total": (upvotes or 0) - (downvotes or 0)
        }

    def get_answer_votes(self, answer_id: str) -> Dict[str, int]:
        """Get vote statistics for an answer"""
        upvotes = self.db.query(func.count(Vote.id)).filter(
            Vote.answer_id == answer_id,
            Vote.vote_type == 1
        ).scalar()
        
        downvotes = self.db.query(func.count(Vote.id)).filter(
            Vote.answer_id == answer_id,
            Vote.vote_type == -1
        ).scalar()
        
        return {
            "upvotes": upvotes or 0,
            "downvotes": downvotes or 0,
            "total": (upvotes or 0) - (downvotes or 0)
        }

    def _update_vote_count(self, target_obj, vote_change: int):
        """Update vote count on question or answer"""
        target_obj.vote_count += vote_change

    def _get_reputation_change(self, vote_type: int) -> int:
        """Get reputation change based on vote type"""
        if vote_type == 1:  # Upvote
            return 5
        elif vote_type == -1:  # Downvote
            return -2
        return 0

    def _update_user_reputation(self, user_id: str, reputation_change: int):
        """Update user reputation"""
        if reputation_change != 0:
            self.user_service.update_user_reputation(user_id, reputation_change)

    def remove_vote(self, user_id: str, question_id: str = None, answer_id: str = None) -> bool:
        """Remove a user's vote"""
        vote = self.get_user_vote(user_id, question_id, answer_id)
        if not vote:
            return False
        
        # Get target object
        target_obj = None
        target_owner_id = None
        
        if question_id:
            target_obj = self.db.query(Question).filter(Question.id == question_id).first()
            target_owner_id = target_obj.user_id if target_obj else None
        else:
            target_obj = self.db.query(Answer).filter(Answer.id == answer_id).first()
            target_owner_id = target_obj.user_id if target_obj else None
        
        if not target_obj:
            return False
        
        # Revert vote count and reputation
        self._update_vote_count(target_obj, -vote.vote_type)
        self._update_user_reputation(target_owner_id, -self._get_reputation_change(vote.vote_type))
        
        # Delete vote
        self.db.delete(vote)
        self.db.commit()
        return True

    def get_top_voted_questions(self, limit: int = 10) -> list:
        """Get questions with highest votes"""
        return self.db.query(Question).order_by(Question.vote_count.desc()).limit(limit).all()

    def get_top_voted_answers(self, limit: int = 10) -> list:
        """Get answers with highest votes"""
        return self.db.query(Answer).order_by(Answer.vote_count.desc()).limit(limit).all() 