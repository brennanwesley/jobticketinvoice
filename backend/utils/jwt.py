from datetime import datetime
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from core.config import settings
from database import get_db
from models.user import User

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

def verify_access_token(token: str) -> dict:
    """Verify a JWT token and return the payload"""
    try:
        # Decode the JWT token
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        
        # Extract user ID from payload
        user_id: Optional[int] = payload.get("sub")
        
        # Validate user ID
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create token data
        token_data = {"user_id": user_id}
        return token_data
    
    except JWTError:
        # Handle JWT errors
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> User:
    """Get the current user from the token"""
    # Verify token
    token_data = verify_access_token(token)
    
    # Get user from database
    user = db.query(User).filter(User.id == token_data["user_id"]).first()
    
    # Validate user exists
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Check if the current user is active"""
    # You could add an 'is_active' field to the User model
    # and check it here if needed
    return current_user

def get_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Check if the current user is an admin"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user

def get_manager_or_admin_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Check if the current user is a manager or admin"""
    if current_user.role not in ["manager", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user
