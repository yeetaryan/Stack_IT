from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Base schemas
class UserBase(BaseModel):
    email: str = Field(..., max_length=255)
    username: str = Field(..., max_length=50)
    display_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    id: str
    reputation: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserWithStats(UserResponse):
    question_count: int = 0
    answer_count: int = 0

# Tag schemas
class TagBase(BaseModel):
    name: str = Field(..., max_length=50)
    description: Optional[str] = None
    color: Optional[str] = Field('#3B82F6', max_length=7)

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: str
    usage_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Question schemas
class QuestionBase(BaseModel):
    title: str = Field(..., max_length=255)
    content: str = Field(..., min_length=10)

class QuestionCreate(QuestionBase):
    tag_names: List[str] = Field(..., min_items=1, max_items=5)

class QuestionUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = Field(None, min_length=10)
    tag_names: Optional[List[str]] = Field(None, max_items=5)

class QuestionResponse(QuestionBase):
    id: str
    user_id: str
    views: int
    vote_count: int
    answer_count: int
    is_solved: bool
    created_at: datetime
    updated_at: datetime
    author: UserResponse
    tags: List[TagResponse]
    
    class Config:
        from_attributes = True

class QuestionListResponse(BaseModel):
    id: str
    title: str
    content: str
    views: int
    vote_count: int
    answer_count: int
    is_solved: bool
    created_at: datetime
    author: UserResponse
    tags: List[TagResponse]
    
    class Config:
        from_attributes = True

# Answer schemas
class AnswerBase(BaseModel):
    content: str = Field(..., min_length=10)

class AnswerCreate(AnswerBase):
    question_id: str

class AnswerUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=10)

class AnswerResponse(AnswerBase):
    id: str
    question_id: str
    user_id: str
    vote_count: int
    is_accepted: bool
    created_at: datetime
    updated_at: datetime
    author: UserResponse
    
    class Config:
        from_attributes = True

# Vote schemas
class VoteCreate(BaseModel):
    question_id: Optional[str] = None
    answer_id: Optional[str] = None
    vote_type: int = Field(..., ge=-1, le=1)  # -1, 0, or 1

class VoteResponse(BaseModel):
    id: str
    user_id: str
    question_id: Optional[str]
    answer_id: Optional[str]
    vote_type: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Search and filter schemas
class SearchRequest(BaseModel):
    query: Optional[str] = None
    tags: Optional[List[str]] = None
    sort_by: Optional[str] = Field('created_at')
    sort_order: Optional[str] = Field('desc')
    page: Optional[int] = Field(1, ge=1)
    limit: Optional[int] = Field(10, ge=1, le=50)

# Response wrappers
class PaginatedResponse(BaseModel):
    items: List[dict]
    total: int
    page: int
    limit: int
    total_pages: int

class MessageResponse(BaseModel):
    message: str
    success: bool = True

# Question with answers
class QuestionWithAnswers(QuestionResponse):
    answers: List[AnswerResponse]
    
    class Config:
        from_attributes = True 