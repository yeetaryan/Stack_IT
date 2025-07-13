from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database.config import get_db
from app.schemas.schemas import UserCreate, UserUpdate, UserResponse, UserWithStats
from app.services.user_service import UserService

router = APIRouter(prefix="/api/users", tags=["users"])

# Temporary user ID for testing (replace with Auth0 later)
def get_current_user_id() -> str:
    return "temp-user-123"

@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    user_service = UserService(db)
    
    # Check if user already exists
    if user_service.get_user_by_email(user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if user_service.get_user_by_username(user.username):
        raise HTTPException(status_code=400, detail="Username already taken")
    
    return user_service.create_user(user)

@router.get("/{user_id}", response_model=UserWithStats)
def get_user(user_id: str, db: Session = Depends(get_db)):
    """Get user by ID with statistics"""
    user_service = UserService(db)
    user = user_service.get_user_by_id(user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    stats = user_service.get_user_stats(user_id)
    return UserWithStats(**user.__dict__, **stats)

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: str, user_update: UserUpdate, db: Session = Depends(get_db)):
    """Update user information"""
    user_service = UserService(db)
    user = user_service.update_user(user_id, user_update)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@router.get("/", response_model=List[UserResponse])
def get_users(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """Get all users with pagination"""
    user_service = UserService(db)
    return user_service.get_users(skip, limit) 