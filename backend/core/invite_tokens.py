"""
Secure JWT token service for tech invite system
Provides tamper-proof, time-bound, single-use invite tokens
"""

from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import HTTPException, status
import secrets
import logging

from core.config import settings

logger = logging.getLogger(__name__)

class InviteTokenService:
    """Service for generating and validating secure invite tokens"""
    
    @staticmethod
    def generate_invite_token(
        invite_id: str,
        company_id: str,
        tech_name: str,
        email: str,
        expires_hours: int = 48
    ) -> str:
        """
        Generate a secure JWT invite token
        
        Args:
            invite_id: Unique invite identifier
            company_id: Company UUID
            tech_name: Technician name
            email: Technician email
            expires_hours: Token expiration in hours (default 48)
            
        Returns:
            JWT token string
        """
        try:
            # Create expiration timestamp
            expires_at = datetime.utcnow() + timedelta(hours=expires_hours)
            
            # Create JWT payload with security claims
            payload = {
                "invite_id": invite_id,
                "company_id": company_id,
                "tech_name": tech_name,
                "email": email,
                "role": "tech",  # Locked to tech role
                "exp": expires_at,
                "iat": datetime.utcnow(),
                "iss": "jobticket-invite-system",  # Issuer
                "jti": secrets.token_urlsafe(16),  # Unique token ID
                "type": "tech_invite"
            }
            
            # Generate JWT token
            token = jwt.encode(
                payload,
                settings.auth.secret_key.get_secret_value(),
                algorithm="HS256"
            )
            
            logger.info(f"Generated invite token for {email} (invite_id: {invite_id})")
            return token
            
        except Exception as e:
            logger.error(f"Failed to generate invite token: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to generate invite token"
            )
    
    @staticmethod
    def validate_invite_token(token: str) -> Dict[str, Any]:
        """
        Validate and decode an invite token
        
        Args:
            token: JWT token string
            
        Returns:
            Decoded token payload
            
        Raises:
            HTTPException: If token is invalid, expired, or tampered
        """
        try:
            # Decode and validate JWT token
            payload = jwt.decode(
                token,
                settings.auth.secret_key.get_secret_value(),
                algorithms=["HS256"],
                options={
                    "verify_exp": True,
                    "verify_iat": True,
                    "verify_iss": True,
                    "require": ["invite_id", "company_id", "tech_name", "email", "role", "type"]
                }
            )
            
            # Validate token type
            if payload.get("type") != "tech_invite":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token type"
                )
            
            # Validate role is locked to tech
            if payload.get("role") != "tech":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid role in token"
                )
            
            # Validate issuer
            if payload.get("iss") != "jobticket-invite-system":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token issuer"
                )
            
            logger.info(f"Validated invite token for {payload.get('email')} (invite_id: {payload.get('invite_id')})")
            return payload
            
        except jwt.ExpiredSignatureError:
            logger.warning(f"Expired invite token: {token[:20]}...")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invite token has expired"
            )
        except JWTError as e:
            logger.warning(f"Invalid invite token: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or tampered invite token"
            )
        except Exception as e:
            logger.error(f"Token validation error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Token validation failed"
            )
    
    @staticmethod
    def extract_invite_id(token: str) -> Optional[str]:
        """
        Extract invite_id from token without full validation
        Useful for database lookups before full validation
        
        Args:
            token: JWT token string
            
        Returns:
            invite_id or None if extraction fails
        """
        try:
            # Decode without verification for invite_id extraction
            payload = jwt.decode(
                token,
                options={"verify_signature": False}
            )
            return payload.get("invite_id")
        except Exception:
            return None
    
    @staticmethod
    def generate_signup_link(token: str, frontend_url: str) -> str:
        """
        Generate signup link for SMS/Email delivery
        
        Args:
            token: JWT invite token
            frontend_url: Frontend base URL
            
        Returns:
            Complete signup URL
        """
        return f"{frontend_url}/signup-tech?token={token}"
