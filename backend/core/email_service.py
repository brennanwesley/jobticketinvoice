"""
SendGrid Email Service for QuickTicketAI
Handles secure email delivery for technician invitations
"""

import logging
from typing import Optional
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, From, To, Subject, PlainTextContent
from core.config import settings

logger = logging.getLogger(__name__)

class EmailService:
    """SendGrid email service for sending technician invitations"""
    
    def __init__(self):
        """Initialize SendGrid email service"""
        self.api_key = settings.email.sendgrid_api_key.get_secret_value() if settings.email.sendgrid_api_key else None
        self.from_email = settings.email.sendgrid_from_email if hasattr(settings.email, 'sendgrid_from_email') else settings.email.from_email
        
        # Use dev mode from centralized configuration
        self.dev_mode = settings.email.dev_mode
        
        if self.dev_mode:
            logger.info("Email service running in development mode (EMAIL_DEV_MODE=true)")
            self.sg = None
        else:
            if not self.api_key:
                logger.error("SendGrid API key not configured but dev mode is disabled")
                raise ValueError("SendGrid API key required when dev mode is disabled")
            self.sg = SendGridAPIClient(api_key=self.api_key)
            logger.info("SendGrid email service initialized successfully")
    
    async def send_tech_invitation(
        self, 
        tech_name: str, 
        tech_email: str, 
        company_name: str, 
        invite_token: str
    ) -> bool:
        """
        Send technician invitation email via SendGrid
        Returns True if email was sent successfully, False otherwise
        """
        import traceback
        
        logger.info(f"=== EMAIL SERVICE DEBUG: send_tech_invitation called ===")
        logger.info(f"Parameters: tech_name={tech_name}, tech_email={tech_email}, company_name={company_name}")
        logger.info(f"Token length: {len(invite_token) if invite_token else 'None'}")
        logger.info(f"Dev mode: {self.dev_mode}")
        logger.info(f"SendGrid client: {'Initialized' if self.sg else 'None'}")
        
        try:
            # Development mode - just log the email
            if self.dev_mode:
                logger.info(f"[DEV MODE] Email service in development mode - logging email instead of sending:")
                logger.info(f"  To: {tech_email}")
                logger.info(f"  Tech Name: {tech_name}")
                logger.info(f"  Company: {company_name}")
                logger.info(f"  Invite Token: {invite_token[:20]}..." if invite_token else "No token")
                
                # Create signup URL for logging
                signup_url = f"{settings.email.frontend_url}/signup-tech?token={invite_token}"
                logger.info(f"  Signup URL: {signup_url}")
                
                logger.info(f"[DEV MODE] Email would be sent successfully - returning True")
                return True
            
            # Production mode - attempt to send via SendGrid
            logger.info("Production mode - attempting to send via SendGrid...")
            
            if not self.sg:
                logger.error("CRITICAL: SendGrid client not initialized but not in dev mode")
                logger.error(f"API Key present: {self.api_key is not None}")
                logger.error(f"From email: {self.from_email}")
                return False
            
            logger.info("SendGrid client is initialized - creating email content...")
            
            # Create email content
            subject = f"Invitation to join {company_name} team"
            logger.info(f"Email subject: {subject}")
            
            # Create signup URL with token
            signup_url = f"{settings.email.frontend_url}/signup-tech?token={invite_token}"
            logger.info(f"Signup URL: {signup_url}")
            
            plain_content = f"""
Hello {tech_name},

You've been invited to join the {company_name} team as a field technician.

To complete your registration, please click the link below:
{signup_url}

This invitation will expire in 48 hours.

If you have any questions, please contact your manager.

Best regards,
{company_name} Team
            """.strip()
            
            logger.info(f"Email content created (length: {len(plain_content)} chars)")
            
            # Create the email
            logger.info("Creating SendGrid Mail object...")
            try:
                message = Mail(
                    from_email=From(self.from_email, "JobTicket Invoice"),
                    to_emails=To(tech_email),
                    subject=Subject(subject),
                    plain_text_content=PlainTextContent(plain_content)
                )
                logger.info("SendGrid Mail object created successfully")
            except Exception as mail_error:
                logger.error(f"Error creating SendGrid Mail object: {str(mail_error)}")
                logger.error(f"Mail creation traceback: {traceback.format_exc()}")
                return False
            
            # Send the email
            logger.info("Sending email via SendGrid API...")
            try:
                response = self.sg.send(message)
                logger.info(f"SendGrid API response received - Status: {response.status_code}")
                logger.info(f"Response headers: {dict(response.headers) if hasattr(response, 'headers') else 'No headers'}")
                
                if response.status_code in [200, 201, 202]:
                    logger.info(f"SUCCESS: Tech invitation email sent successfully to {tech_email}")
                    return True
                else:
                    logger.error(f"FAILED: SendGrid API returned status {response.status_code}")
                    logger.error(f"Response body: {response.body if hasattr(response, 'body') else 'No body'}")
                    return False
                    
            except Exception as send_error:
                logger.error(f"Error calling SendGrid API: {str(send_error)}")
                logger.error(f"SendGrid API traceback: {traceback.format_exc()}")
                return False
                
        except Exception as e:
            logger.error(f"=== UNEXPECTED ERROR in send_tech_invitation ===")
            logger.error(f"Error type: {type(e).__name__}")
            logger.error(f"Error message: {str(e)}")
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return False
    
    def is_configured(self) -> bool:
        """Check if email service is configured (either SendGrid or dev mode)"""
        return True  # Always configured - either SendGrid or dev mode fallback

# Global email service instance
email_service = EmailService()
