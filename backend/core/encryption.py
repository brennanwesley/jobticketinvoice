"""
Encryption utilities for field-level encryption in the application.
Uses AES-256 encryption via the Fernet implementation from the cryptography package.
"""
from cryptography.fernet import Fernet
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger(__name__)

# Get encryption key from environment
FERNET_KEY = os.getenv("FERNET_KEY")
if not FERNET_KEY:
    logger.warning("FERNET_KEY not found in environment variables. Using a temporary key for development.")
    # Generate a temporary key for development - this should NEVER be used in production
    FERNET_KEY = Fernet.generate_key().decode()
    logger.warning(f"Temporary FERNET_KEY generated: {FERNET_KEY}")
else:
    logger.info("FERNET_KEY loaded from environment variables.")

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
