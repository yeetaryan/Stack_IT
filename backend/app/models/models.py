from sqlalchemy import Column, String, Integer, Text, Boolean, DateTime, ForeignKey, Table, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.config import Base
import uuid

# Association table for many-to-many relationship between questions and tags
question_tags = Table(
    'question_tags',
    Base.metadata,
    Column('question_id', String(36), ForeignKey('questions.id'), primary_key=True),
    Column('tag_id', String(36), ForeignKey('tags.id'), primary_key=True)
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    clerk_id = Column(String(255), unique=True, nullable=True)  # Clerk user ID
    auth0_id = Column(String(255), unique=True, nullable=True)  # Keep for backward compatibility
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(50), unique=True, nullable=False)
    display_name = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    reputation = Column(Integer, default=0)
    avatar_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    questions = relationship("Question", back_populates="author", cascade="all, delete-orphan")
    answers = relationship("Answer", back_populates="author", cascade="all, delete-orphan")
    votes = relationship("Vote", back_populates="user", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_users_username', 'username'),
        Index('idx_users_email', 'email'),
        Index('idx_users_clerk_id', 'clerk_id'),
    )

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(7), default='#3B82F6')
    usage_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    questions = relationship("Question", secondary=question_tags, back_populates="tags")
    
    # Indexes
    __table_args__ = (
        Index('idx_tags_name', 'name'),
        Index('idx_tags_usage_count', 'usage_count'),
    )

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    views = Column(Integer, default=0)
    vote_count = Column(Integer, default=0)
    answer_count = Column(Integer, default=0)
    is_solved = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    author = relationship("User", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")
    votes = relationship("Vote", back_populates="question", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary=question_tags, back_populates="questions")
    
    # Indexes
    __table_args__ = (
        Index('idx_questions_user_id', 'user_id'),
        Index('idx_questions_created_at', 'created_at'),
        Index('idx_questions_vote_count', 'vote_count'),
        Index('idx_questions_title_content', 'title', 'content', mysql_length={'title': 100, 'content': 255}),
    )

class Answer(Base):
    __tablename__ = "answers"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    question_id = Column(String(36), ForeignKey('questions.id'), nullable=False)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    content = Column(Text, nullable=False)
    vote_count = Column(Integer, default=0)
    is_accepted = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    question = relationship("Question", back_populates="answers")
    author = relationship("User", back_populates="answers")
    votes = relationship("Vote", back_populates="answer", cascade="all, delete-orphan")
    
    # Indexes
    __table_args__ = (
        Index('idx_answers_question_id', 'question_id'),
        Index('idx_answers_user_id', 'user_id'),
        Index('idx_answers_created_at', 'created_at'),
        Index('idx_answers_is_accepted', 'is_accepted'),
    )

class Vote(Base):
    __tablename__ = "votes"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    question_id = Column(String(36), ForeignKey('questions.id'), nullable=True)
    answer_id = Column(String(36), ForeignKey('answers.id'), nullable=True)
    vote_type = Column(Integer, nullable=False)  # 1 for upvote, -1 for downvote
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="votes")
    question = relationship("Question", back_populates="votes")
    answer = relationship("Answer", back_populates="votes")
    
    # Indexes and constraints
    __table_args__ = (
        Index('idx_votes_user_question', 'user_id', 'question_id'),
        Index('idx_votes_user_answer', 'user_id', 'answer_id'),
        Index('idx_votes_question_id', 'question_id'),
        Index('idx_votes_answer_id', 'answer_id'),
    ) 