from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from ..services.clerk_service import clerk_service
from ..services.user_service import UserService
from ..database.config import get_db
from ..models.models import User

security = HTTPBearer(auto_error=False)

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[Dict[str, Any]]:
    """Get current user from Clerk token"""
    if not credentials:
        print("⚠️ No credentials provided")
        return None
    
    try:
        print(f"🔍 Verifying token: {credentials.credentials[:20]}...")
        
        # Verify the token with Clerk
        user_data = await clerk_service.verify_jwt_token(credentials.credentials)
        
        if not user_data:
            print("❌ Token verification failed")
            return None
        
        print(f"✅ Token verified. User data: {user_data}")
        
        # Extract user info from Clerk data
        clerk_user_id = user_data.get('sub')  # Clerk user ID
        email = user_data.get('email')
        name = user_data.get('name') or f"{user_data.get('given_name', '')} {user_data.get('family_name', '')}".strip()
        
        if not clerk_user_id:
            print("❌ No user ID in token")
            return None
        
        print(f"👤 Processing user: {clerk_user_id}, {email}, {name}")
        
        # Create user service instance with database session
        user_service = UserService(db)
        
        # Sync user with local database (synchronous call)
        local_user = user_service.sync_clerk_user(
            clerk_user_id=clerk_user_id,
            email=email,
            name=name,
            avatar_url=user_data.get('image_url', '')
        )
        
        result = {
            'clerk_id': clerk_user_id,
            'local_user': local_user,
            'email': email,
            'name': name,
            'avatar_url': user_data.get('image_url', '')
        }
        
        print(f"✅ User sync successful: {local_user.id}")
        return result
    
    except Exception as e:
        print(f"💥 Error getting current user: {e}")
        import traceback
        traceback.print_exc()
        return None

async def require_auth(
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
) -> Dict[str, Any]:
    """Require authentication - raises 401 if not authenticated"""
    if not current_user:
        print("❌ Authentication required but no user found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    print(f"✅ Authentication successful for user: {current_user['local_user'].id}")
    return current_user

async def optional_auth(
    current_user: Optional[Dict[str, Any]] = Depends(get_current_user)
) -> Optional[Dict[str, Any]]:
    """Optional authentication - returns None if not authenticated"""
    return current_user 