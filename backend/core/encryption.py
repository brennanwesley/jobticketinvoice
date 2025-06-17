"""
Encryption utilities for field-level encryption in the application.
Uses AES-256 encryption via the Fernet implementation from the cryptography package.
"""
from cryptography.fernet import Fernet
import logging
from dotenv import load_dotenv
from core.config import settings

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

# Get encryption key from centralized configuration
FERNET_KEY = settings.security.fernet_key.get_secret_value()
logger.info("FERNET_KEY loaded from centralized configuration.")

# Initialize Fernet cipher with the key
fernet = Fernet(FERNET_KEY.encode())

def encrypt_field(value: str) -> str:
    """
    Encrypt a string value using Fernet (AES-256).
    
    Args:
        value: The string value to encrypt
        
    Returns:
        Encrypted string in base64 format
    """
    if value is None:
        return None
    
    try:
        return fernet.encrypt(str(value).encode()).decode()
    except Exception as e:
        logger.error(f"Encryption error: {str(e)}")
        raise

def decrypt_field(value: str) -> str:
    """
    Decrypt a Fernet-encrypted string value.
    
    Args:
        value: The encrypted string to decrypt
        
    Returns:
        Decrypted string value
    """
    if value is None:
        return None
    
    try:
        return fernet.decrypt(value.encode()).decode()
    except Exception as e:
        logger.error(f"Decryption error: {str(e)}")
        raise
