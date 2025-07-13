from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models.models import Tag, Question
from app.schemas.schemas import TagCreate
from typing import Optional, List

class TagService:
    def __init__(self, db: Session):
        self.db = db

    def create_tag(self, tag_data: TagCreate) -> Tag:
        """Create a new tag"""
        db_tag = Tag(**tag_data.model_dump())
        db_tag.name = db_tag.name.lower()  # Normalize tag names
        self.db.add(db_tag)
        self.db.commit()
        self.db.refresh(db_tag)
        return db_tag

    def get_tag_by_id(self, tag_id: str) -> Optional[Tag]:
        """Get tag by ID"""
        return self.db.query(Tag).filter(Tag.id == tag_id).first()

    def get_tag_by_name(self, name: str) -> Optional[Tag]:
        """Get tag by name"""
        return self.db.query(Tag).filter(Tag.name == name.lower()).first()

    def get_or_create_tag(self, name: str) -> Tag:
        """Get existing tag or create new one"""
        tag = self.get_tag_by_name(name)
        if not tag:
            tag = Tag(name=name.lower())
            self.db.add(tag)
            self.db.commit()
            self.db.refresh(tag)
        return tag

    def get_all_tags(self, skip: int = 0, limit: int = 50) -> List[Tag]:
        """Get all tags with pagination"""
        return self.db.query(Tag).order_by(desc(Tag.usage_count)).offset(skip).limit(limit).all()

    def get_popular_tags(self, limit: int = 20) -> List[Tag]:
        """Get most popular tags"""
        return self.db.query(Tag).order_by(desc(Tag.usage_count)).limit(limit).all()

    def search_tags(self, query: str, limit: int = 10) -> List[Tag]:
        """Search tags by name"""
        search_term = f"%{query.lower()}%"
        return self.db.query(Tag).filter(
            Tag.name.ilike(search_term)
        ).order_by(desc(Tag.usage_count)).limit(limit).all()

    def update_tag(self, tag_id: str, tag_data: TagCreate) -> Optional[Tag]:
        """Update a tag"""
        tag = self.get_tag_by_id(tag_id)
        if not tag:
            return None
        
        update_data = tag_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == 'name':
                value = value.lower()
            setattr(tag, field, value)
        
        self.db.commit()
        self.db.refresh(tag)
        return tag

    def delete_tag(self, tag_id: str) -> bool:
        """Delete a tag (only if not used)"""
        tag = self.get_tag_by_id(tag_id)
        if not tag:
            return False
        
        # Check if tag is used in any questions
        if tag.usage_count > 0:
            return False
        
        self.db.delete(tag)
        self.db.commit()
        return True

    def get_tag_statistics(self) -> dict:
        """Get tag statistics"""
        total_tags = self.db.query(func.count(Tag.id)).scalar()
        most_used_tag = self.db.query(Tag).order_by(desc(Tag.usage_count)).first()
        
        return {
            "total_tags": total_tags or 0,
            "most_used_tag": most_used_tag.name if most_used_tag else None,
            "most_used_count": most_used_tag.usage_count if most_used_tag else 0
        }

    def get_questions_by_tag(self, tag_name: str, skip: int = 0, limit: int = 10) -> List[Question]:
        """Get questions by tag name"""
        return self.db.query(Question).join(Question.tags).filter(
            Tag.name == tag_name.lower()
        ).order_by(desc(Question.created_at)).offset(skip).limit(limit).all()

    def get_related_tags(self, tag_name: str, limit: int = 5) -> List[Tag]:
        """Get tags that are commonly used together with the given tag"""
        # Get questions that use this tag
        questions_with_tag = self.db.query(Question).join(Question.tags).filter(
            Tag.name == tag_name.lower()
        ).subquery()
        
        # Get other tags used in these questions
        related_tags = self.db.query(Tag).join(Tag.questions).filter(
            Question.id.in_(self.db.query(questions_with_tag.c.id)),
            Tag.name != tag_name.lower()
        ).group_by(Tag.id).order_by(desc(func.count(Question.id))).limit(limit).all()
        
        return related_tags

    def cleanup_unused_tags(self) -> int:
        """Remove tags with usage_count = 0"""
        unused_tags = self.db.query(Tag).filter(Tag.usage_count == 0).all()
        count = len(unused_tags)
        
        for tag in unused_tags:
            self.db.delete(tag)
        
        self.db.commit()
        return count 