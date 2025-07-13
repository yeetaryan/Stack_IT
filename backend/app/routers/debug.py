from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from app.database.config import get_db
from app.dependencies.auth import get_current_user, require_auth
from app.services.user_service import UserService
from app.models.models import User

router = APIRouter(prefix="/api/debug", tags=["debug"])

@router.get("/auth-test")
async def test_auth(
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test authentication endpoint"""
    return {
        "authenticated": current_user is not None,
        "user_data": current_user,
        "total_users_in_db": db.query(User).count()
    }

@router.get("/auth-required-test")
async def test_auth_required(
    current_user: Dict[str, Any] = Depends(require_auth)
):
    """Test required authentication endpoint"""
    return {
        "message": "Authentication successful!",
        "user": current_user
    }

@router.get("/users")
async def list_users(db: Session = Depends(get_db)):
    """List all users in database"""
    users = db.query(User).all()
    return {
        "total_users": len(users),
        "users": [
            {
                "id": user.id,
                "clerk_id": user.clerk_id,
                "email": user.email,
                "username": user.username,
                "display_name": user.display_name,
                "created_at": user.created_at
            }
            for user in users
        ]
    } 