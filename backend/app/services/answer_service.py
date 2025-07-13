from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from app.models.models import Answer, Question, User
from app.schemas.schemas import AnswerCreate, AnswerUpdate
from typing import Optional, List

class AnswerService:
    def __init__(self, db: Session):
        self.db = db

    def create_answer(self, answer_data: AnswerCreate, user_id: str) -> Answer:
        """Create a new answer"""
        # Create the answer
        db_answer = Answer(**answer_data.model_dump(), user_id=user_id)
        self.db.add(db_answer)
        
        # Update question answer count
        question = self.db.query(Question).filter(Question.id == answer_data.question_id).first()
        if question:
            question.answer_count += 1
        
        self.db.commit()
        self.db.refresh(db_answer)
        return db_answer

    def get_answer_by_id(self, answer_id: str) -> Optional[Answer]:
        """Get answer by ID with author information"""
        return self.db.query(Answer).options(
            joinedload(Answer.author),
            joinedload(Answer.question)
        ).filter(Answer.id == answer_id).first()

    def update_answer(self, answer_id: str, answer_data: AnswerUpdate, user_id: str) -> Optional[Answer]:
        """Update an answer (only by owner)"""
        answer = self.db.query(Answer).filter(
            Answer.id == answer_id,
            Answer.user_id == user_id
        ).first()
        
        if not answer:
            return None
        
        update_data = answer_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(answer, field, value)
        
        self.db.commit()
        self.db.refresh(answer)
        return answer

    def delete_answer(self, answer_id: str, user_id: str) -> bool:
        """Delete an answer (only by owner)"""
        answer = self.db.query(Answer).filter(
            Answer.id == answer_id,
            Answer.user_id == user_id
        ).first()
        
        if not answer:
            return False
        
        # Update question answer count
        question = self.db.query(Question).filter(Question.id == answer.question_id).first()
        if question:
            question.answer_count -= 1
        
        self.db.delete(answer)
        self.db.commit()
        return True

    def get_answers_by_question(self, question_id: str) -> List[Answer]:
        """Get all answers for a specific question"""
        return self.db.query(Answer).options(
            joinedload(Answer.author)
        ).filter(Answer.question_id == question_id).order_by(
            desc(Answer.is_accepted),  # Accepted answers first
            desc(Answer.vote_count),   # Then by vote count
            desc(Answer.created_at)    # Then by creation date
        ).all()

    def get_user_answers(self, user_id: str, skip: int = 0, limit: int = 10) -> List[Answer]:
        """Get answers by a specific user"""
        return self.db.query(Answer).options(
            joinedload(Answer.author),
            joinedload(Answer.question)
        ).filter(Answer.user_id == user_id).order_by(
            desc(Answer.created_at)
        ).offset(skip).limit(limit).all()

    def accept_answer(self, answer_id: str, question_owner_id: str) -> bool:
        """Accept an answer (only by question owner)"""
        answer = self.db.query(Answer).filter(Answer.id == answer_id).first()
        if not answer:
            return False
        
        # Check if the user owns the question
        question = self.db.query(Question).filter(
            Question.id == answer.question_id,
            Question.user_id == question_owner_id
        ).first()
        
        if not question:
            return False
        
        # Un-accept any previously accepted answer for this question
        self.db.query(Answer).filter(
            Answer.question_id == answer.question_id,
            Answer.is_accepted == True
        ).update({Answer.is_accepted: False})
        
        # Accept this answer
        answer.is_accepted = True
        question.is_solved = True
        
        self.db.commit()
        return True

    def unaccept_answer(self, answer_id: str, question_owner_id: str) -> bool:
        """Unaccept an answer (only by question owner)"""
        answer = self.db.query(Answer).filter(Answer.id == answer_id).first()
        if not answer:
            return False
        
        # Check if the user owns the question
        question = self.db.query(Question).filter(
            Question.id == answer.question_id,
            Question.user_id == question_owner_id
        ).first()
        
        if not question:
            return False
        
        # Unaccept the answer
        answer.is_accepted = False
        
        # Check if there are any other accepted answers
        other_accepted = self.db.query(Answer).filter(
            Answer.question_id == answer.question_id,
            Answer.is_accepted == True
        ).first()
        
        if not other_accepted:
            question.is_solved = False
        
        self.db.commit()
        return True

    def get_popular_answers(self, limit: int = 10) -> List[Answer]:
        """Get most popular answers (by votes)"""
        return self.db.query(Answer).options(
            joinedload(Answer.author),
            joinedload(Answer.question)
        ).order_by(desc(Answer.vote_count)).limit(limit).all()

    def get_recent_answers(self, limit: int = 10) -> List[Answer]:
        """Get most recent answers"""
        return self.db.query(Answer).options(
            joinedload(Answer.author),
            joinedload(Answer.question)
        ).order_by(desc(Answer.created_at)).limit(limit).all()

    def get_accepted_answers_by_user(self, user_id: str) -> List[Answer]:
        """Get all accepted answers by a user"""
        return self.db.query(Answer).options(
            joinedload(Answer.author),
            joinedload(Answer.question)
        ).filter(
            Answer.user_id == user_id,
            Answer.is_accepted == True
        ).order_by(desc(Answer.created_at)).all() 