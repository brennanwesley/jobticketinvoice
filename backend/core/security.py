from datetime import datetime, timedelta
from typing import Optional, List, Union
from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session, joinedload

from .config import settings
from database import get_db
# We'll need to import the User model, but we need to avoid circular imports
# So we'll import it inside the function where it's needed

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password for storing"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a new JWT token with multi-tenancy support"""
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    # Create JWT token
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    
    return encoded_jwt

def create_user_token(user) -> str:
    """Create a JWT token for a user with multi-tenancy claims"""
    token_data = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "company_id": user.company_id,
        "is_active": user.is_active
    }
    return create_access_token(token_data)

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Get the current user from the JWT token with multi-tenancy validation"""
    # Define the credentials exception
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the JWT token
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("sub")
        
        if user_id is None:
            raise credentials_exception
            
        # Extract multi-tenancy claims
        token_company_id = payload.get("company_id")
        token_role = payload.get("role")
        token_is_active = payload.get("is_active", True)
        
    except JWTError:
        raise credentials_exception
    
    # Import User model here to avoid circular imports
    from models.user import User
    
    # Get user from database with company relationship loaded
    user = db.query(User).options(joinedload(User.company)).filter(User.id == int(user_id)).first()
    
    if user is None:
        raise credentials_exception
    
    # Validate user is still active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is deactivated"
        )
    
    # Validate token claims match current user state (prevent token reuse after changes)
    if (user.company_id != token_company_id or 
        user.role != token_role or 
        user.is_active != token_is_active):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is no longer valid. Please log in again."
        )
    
    # Update last login timestamp
    user.last_login = datetime.utcnow()
    db.commit()
    
    return user

def require_role(allowed_roles: List[Union[str, object]]):
    """
    Dependency factory for role-based access control
    Usage: Depends(require_role([UserRole.MANAGER, UserRole.ADMIN]))
    """
    def role_checker(current_user = Depends(get_current_user)):
        # Convert enum objects to string values if needed
        role_values = []
        for role in allowed_roles:
            if hasattr(role, 'value'):
                role_values.append(role.value)
            else:
                role_values.append(str(role))
        
        if current_user.role not in role_values:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {', '.join(role_values)}"
            )
        return current_user
    
    return role_checker

def require_company_access(target_company_id: int):
    """
    Dependency factory for company-level access control
    Ensures users can only access data from their own company (except admins)
    """
    def company_checker(current_user = Depends(get_current_user)):
        from models.user import UserRole
        
        # Admins can access any company
        if current_user.role == UserRole.ADMIN:
            return current_user
        
        # Other users can only access their own company
        if current_user.company_id != target_company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: You can only access data from your own company"
            )
        
        return current_user
    
    return company_checker

def get_company_scoped_query(query, model_class, current_user):
    """
    Apply company-level filtering to a SQLAlchemy query
    Admins see all data, other users see only their company's data
    """
    from models.user import UserRole
    
    # Admins can see all data
    if current_user.role == UserRole.ADMIN:
        return query
    
    # Other users see only their company's data
    if hasattr(model_class, 'company_id'):
        return query.filter(model_class.company_id == current_user.company_id)
    
    # If model doesn't have company_id, return original query
    return query
