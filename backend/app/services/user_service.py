from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import User, Question, Answer
from app.schemas.schemas import UserCreate, UserUpdate
from typing import Optional, List
from datetime import datetime
import uuid

class UserService:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, user_data: UserCreate) -> User:
        """Create a new user"""
        db_user = User(**user_data.model_dump())
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()

    def get_user_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        return self.db.query(User).filter(User.username == username).first()

    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_clerk_id(self, clerk_id: str) -> Optional[User]:
        """Get user by Clerk ID"""
        return self.db.query(User).filter(User.clerk_id == clerk_id).first()

    def update_user(self, user_id: str, user_data: UserUpdate) -> Optional[User]:
        """Update user information"""
        user = self.get_user_by_id(user_id)
        if not user:
            return None
        
        update_data = user_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete_user(self, user_id: str) -> bool:
        """Delete a user"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        self.db.delete(user)
        self.db.commit()
        return True

    def get_user_stats(self, user_id: str) -> dict:
        """Get user statistics"""
        question_count = self.db.query(func.count(Question.id)).filter(Question.user_id == user_id).scalar()
        answer_count = self.db.query(func.count(Answer.id)).filter(Answer.user_id == user_id).scalar()
        
        return {
            "question_count": question_count or 0,
            "answer_count": answer_count or 0
        }

    def get_users(self, skip: int = 0, limit: int = 10) -> List[User]:
        """Get all users with pagination"""
        return self.db.query(User).offset(skip).limit(limit).all()

    def update_user_reputation(self, user_id: str, points: int) -> bool:
        """Update user reputation"""
        user = self.get_user_by_id(user_id)
        if not user:
            return False
        
        user.reputation += points
        self.db.commit()
        return True

    def sync_clerk_user(self, clerk_user_id: str, email: str, name: str, avatar_url: str = "") -> User:
        """Sync a Clerk user with local database (synchronous)"""
        print(f"🔄 Syncing Clerk user: {clerk_user_id}, {email}, {name}")
        
        # Check if user already exists
        existing_user = self.get_user_by_clerk_id(clerk_user_id)
        
        if existing_user:
            print(f"✅ Found existing user: {existing_user.id}")
            # Update existing user with latest info
            existing_user.display_name = name
            existing_user.email = email
            existing_user.avatar_url = avatar_url
            existing_user.last_login = datetime.utcnow()
            self.db.commit()
            self.db.refresh(existing_user)
            return existing_user
        
        # Generate a unique username from email
        base_username = email.split('@')[0]
        username = base_username
        counter = 1
        while self.get_user_by_username(username):
            username = f"{base_username}{counter}"
            counter += 1
        
        print(f"🆕 Creating new user with username: {username}")
        
        # Create new user
        new_user = User(
            id=str(uuid.uuid4()),  # Generate new UUID
            clerk_id=clerk_user_id,
            username=username,
            email=email,
            display_name=name,
            avatar_url=avatar_url,
            reputation=0,
            is_active=True,
            created_at=datetime.utcnow(),
            last_login=datetime.utcnow()
        )
        
        self.db.add(new_user)
        self.db.commit()
        self.db.refresh(new_user)
        
        print(f"✅ Created new user: {new_user.id}")
        return new_user 