from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_, desc, asc
from app.models.models import Question, User, Tag, Answer, Vote
from app.schemas.schemas import QuestionCreate, QuestionUpdate, SearchRequest
from typing import Optional, List, Tuple
import math

class QuestionService:
    def __init__(self, db: Session):
        self.db = db

    def create_question(self, question_data: QuestionCreate, user_id: str) -> Question:
        """Create a new question with tags"""
        # Create the question
        question_dict = question_data.model_dump()
        tag_names = question_dict.pop('tag_names')
        
        db_question = Question(**question_dict, user_id=user_id)
        self.db.add(db_question)
        self.db.flush()  # Flush to get the question ID
        
        # Handle tags
        for tag_name in tag_names:
            tag = self.db.query(Tag).filter(Tag.name == tag_name.lower()).first()
            if not tag:
                tag = Tag(name=tag_name.lower(), usage_count=1)
                self.db.add(tag)
            else:
                tag.usage_count += 1
            
            db_question.tags.append(tag)
        
        self.db.commit()
        self.db.refresh(db_question)
        return db_question

    def get_question_by_id(self, question_id: str) -> Optional[Question]:
        """Get question by ID with all relationships"""
        return self.db.query(Question).options(
            joinedload(Question.author),
            joinedload(Question.tags),
            joinedload(Question.answers).joinedload(Answer.author)
        ).filter(Question.id == question_id).first()

    def update_question(self, question_id: str, question_data: QuestionUpdate, user_id: str) -> Optional[Question]:
        """Update a question (only by owner)"""
        question = self.db.query(Question).filter(
            Question.id == question_id,
            Question.user_id == user_id
        ).first()
        
        if not question:
            return None
        
        update_data = question_data.model_dump(exclude_unset=True)
        
        # Handle tags if provided
        if 'tag_names' in update_data:
            tag_names = update_data.pop('tag_names')
            
            # Remove old tags
            for tag in question.tags:
                tag.usage_count -= 1
            question.tags.clear()
            
            # Add new tags
            for tag_name in tag_names:
                tag = self.db.query(Tag).filter(Tag.name == tag_name.lower()).first()
                if not tag:
                    tag = Tag(name=tag_name.lower(), usage_count=1)
                    self.db.add(tag)
                else:
                    tag.usage_count += 1
                
                question.tags.append(tag)
        
        # Update other fields
        for field, value in update_data.items():
            setattr(question, field, value)
        
        self.db.commit()
        self.db.refresh(question)
        return question

    def delete_question(self, question_id: str, user_id: str) -> bool:
        """Delete a question (only by owner)"""
        question = self.db.query(Question).filter(
            Question.id == question_id,
            Question.user_id == user_id
        ).first()
        
        if not question:
            return False
        
        # Decrease tag usage count
        for tag in question.tags:
            tag.usage_count -= 1
        
        self.db.delete(question)
        self.db.commit()
        return True

    def get_questions(self, search_params: SearchRequest) -> Tuple[List[Question], int]:
        """Get questions with search, filter, and pagination"""
        query = self.db.query(Question).options(
            joinedload(Question.author),
            joinedload(Question.tags)
        )
        
        # Apply search filter
        if search_params.query:
            search_term = f"%{search_params.query}%"
            query = query.filter(
                or_(
                    Question.title.ilike(search_term),
                    Question.content.ilike(search_term)
                )
            )
        
        # Apply tag filter
        if search_params.tags:
            query = query.join(Question.tags).filter(
                Tag.name.in_([tag.lower() for tag in search_params.tags])
            )
        
        # Apply sorting
        sort_column = getattr(Question, search_params.sort_by)
        if search_params.sort_order == 'desc':
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (search_params.page - 1) * search_params.limit
        questions = query.offset(offset).limit(search_params.limit).all()
        
        return questions, total

    def get_user_questions(self, user_id: str, skip: int = 0, limit: int = 10) -> List[Question]:
        """Get questions by a specific user"""
        return self.db.query(Question).options(
            joinedload(Question.author),
            joinedload(Question.tags)
        ).filter(Question.user_id == user_id).offset(skip).limit(limit).all()

    def increment_views(self, question_id: str) -> bool:
        """Increment question view count"""
        question = self.db.query(Question).filter(Question.id == question_id).first()
        if question:
            question.views += 1
            self.db.commit()
            return True
        return False

    def mark_as_solved(self, question_id: str, user_id: str) -> bool:
        """Mark question as solved (only by owner)"""
        question = self.db.query(Question).filter(
            Question.id == question_id,
            Question.user_id == user_id
        ).first()
        
        if question:
            question.is_solved = True
            self.db.commit()
            return True
        return False

    def get_popular_questions(self, limit: int = 10) -> List[Question]:
        """Get most popular questions (by votes)"""
        return self.db.query(Question).options(
            joinedload(Question.author),
            joinedload(Question.tags)
        ).order_by(desc(Question.vote_count)).limit(limit).all()

    def get_recent_questions(self, limit: int = 10) -> List[Question]:
        """Get most recent questions"""
        return self.db.query(Question).options(
            joinedload(Question.author),
            joinedload(Question.tags)
        ).order_by(desc(Question.created_at)).limit(limit).all()

    def get_unanswered_questions(self, limit: int = 10) -> List[Question]:
        """Get questions with no answers"""
        return self.db.query(Question).options(
            joinedload(Question.author),
            joinedload(Question.tags)
        ).filter(Question.answer_count == 0).order_by(desc(Question.created_at)).limit(limit).all()

    def search_questions(self, query: str, limit: int = 10) -> List[Question]:
        """Full-text search in questions"""
        search_term = f"%{query}%"
        return self.db.query(Question).options(
            joinedload(Question.author),
            joinedload(Question.tags)
        ).filter(
            or_(
                Question.title.ilike(search_term),
                Question.content.ilike(search_term)
            )
        ).order_by(desc(Question.vote_count)).limit(limit).all() 