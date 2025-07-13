import httpx
import jwt
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
from decouple import config
import json
import base64
import time

class ClerkService:
    def __init__(self):
        self.secret_key = config('CLERK_SECRET_KEY')
        self.publishable_key = config('CLERK_PUBLISHABLE_KEY', default='')
        self.base_url = "https://api.clerk.com/v1"
        self.headers = {
            "Authorization": f"Bearer {self.secret_key}",
            "Content-Type": "application/json"
        }
    
    async def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify a Clerk JWT token"""
        return await self.verify_jwt_token(token)
    
    async def verify_jwt_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify a Clerk JWT token"""
        try:
            print(f"🔍 Decoding JWT token...")
            
            # For development, we'll decode without verification
            # In production, you should verify the signature with Clerk's public key
            decoded = jwt.decode(token, options={"verify_signature": False})
            
            print(f"📄 Decoded token: {decoded}")
            
            # Check if token is expired
            current_time = int(time.time())
            exp = decoded.get('exp', 0)
            
            if exp and current_time > exp:
                print("❌ Token expired")
                return None
            
            # Get user ID from token
            user_id = decoded.get('sub')  # 'sub' is the user ID in JWT
            
            if not user_id:
                print("❌ No user ID in token")
                return None
            
            print(f"👤 User ID from token: {user_id}")
            
            # Get additional user data from Clerk API
            user_data = await self.get_user(user_id)
            if user_data:
                result = {
                    'sub': user_id,  # Keep original field name
                    'user_id': user_id,
                    'email': user_data.get('email_addresses', [{}])[0].get('email_address'),
                    'given_name': user_data.get('first_name', ''),
                    'family_name': user_data.get('last_name', ''),
                    'name': f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip(),
                    'image_url': user_data.get('image_url', ''),
                    'clerk_data': user_data
                }
                print(f"✅ User data retrieved: {result}")
                return result
            
            print("❌ Could not get user data from Clerk API")
            return None
        except Exception as e:
            print(f"💥 Error verifying JWT: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get user data from Clerk"""
        try:
            print(f"🔍 Getting user data for: {user_id}")
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/users/{user_id}",
                    headers=self.headers
                )
                
                print(f"📡 Clerk API response: {response.status_code}")
                
                if response.status_code == 200:
                    user_data = response.json()
                    print(f"✅ User data from Clerk: {user_data}")
                    return user_data
                else:
                    print(f"❌ Clerk API error: {response.text}")
                    return None
        except Exception as e:
            print(f"💥 Error getting user: {e}")
            import traceback
            traceback.print_exc()
            return None

# Create a global instance
clerk_service = ClerkService() 