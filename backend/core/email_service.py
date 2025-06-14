"""
SendGrid Email Service for QuickTicketAI
Handles secure email delivery for technician invitations
"""

import os
import logging
from typing import Optional
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, From, To, Subject, PlainTextContent

logger = logging.getLogger(__name__)

class EmailService:
    """SendGrid email service for sending technician invitations"""
    
    def __init__(self):
        """Initialize SendGrid email service"""
        self.api_key = os.getenv("SENDGRID_API_KEY")
        self.from_email = os.getenv("SENDGRID_FROM_EMAIL", "noreply@jobticketinvoice.com")
        self.dev_mode = os.getenv("EMAIL_DEV_MODE", "false").lower() == "true"
        
        if not self.api_key:
            if self.dev_mode:
                logger.info("Email service running in development mode - emails will be logged instead of sent")
                self.sg = None
            else:
                logger.warning("SendGrid API key not configured - email sending will be disabled")
                self.sg = None
        else:
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
        try:
            # Development mode - just log the email
            if self.dev_mode:
                logger.info(f"[DEV MODE] Would send tech invitation email:")
                logger.info(f"  To: {tech_email}")
                logger.info(f"  Tech Name: {tech_name}")
                logger.info(f"  Company: {company_name}")
                logger.info(f"  Invite Token: {invite_token[:20]}...")
                return True
            
            if not self.sg:
                logger.error("SendGrid client not initialized")
                return False
            
            # Create email content
            subject = f"Invitation to join {company_name} team"
            
            # Create signup URL with token
            signup_url = f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/signup-tech?token={invite_token}"
            
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
            
            # Create the email
            message = Mail(
                from_email=From(self.from_email, "JobTicket Invoice"),
                to_emails=To(tech_email),
                subject=Subject(subject),
                plain_text_content=PlainTextContent(plain_content)
            )
            
            # Send the email
            response = self.sg.send(message)
            
            if response.status_code in [200, 201, 202]:
                logger.info(f"Tech invitation email sent successfully to {tech_email}")
                return True
            else:
                logger.error(f"SendGrid API returned status {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending tech invitation email: {str(e)}")
            return False
    
    def is_configured(self) -> bool:
        """Check if SendGrid is properly configured or if dev mode is enabled"""
        return bool(self.api_key and self.from_email) or self.dev_mode

# Global email service instance
email_service = EmailService()
