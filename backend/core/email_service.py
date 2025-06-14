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
        
        if not self.api_key:
            logger.warning("SendGrid API key not configured - email sending will be disabled")
            self.sg = None
        else:
            self.sg = SendGridAPIClient(api_key=self.api_key)
            logger.info("SendGrid email service initialized successfully")
    
    async def send_tech_invitation(
        self, 
        tech_name: str, 
        email: str, 
        company_name: str, 
        invite_token: str
    ) -> bool:
        """
        Send technician invitation email via SendGrid
        
        Args:
            tech_name: Name of the technician being invited
            email: Email address to send invitation to
            company_name: Name of the company extending the invitation
            invite_token: Secure token for the invitation link
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        try:
            # Check if SendGrid is configured
            if not self.sg:
                logger.warning(f"SendGrid not configured - cannot send email to {email}")
                logger.info(f"Mock email would be sent to {tech_name} ({email}) with token: {invite_token}")
                return False
            
            # Construct the signup URL
            signup_url = f"https://quickticketai.com/signup-tech?token={invite_token}"
            
            # Compose email content
            subject = "You've been invited to join QuickTicketAI"
            
            body = f"""Hello {tech_name},

You've been invited to join QuickTicketAI by your manager at {company_name}.

Click the link below to create your account:

{signup_url}

This link will expire in 48 hours.

— QuickTicketAI Team"""
            
            # Create SendGrid mail object
            message = Mail(
                from_email=From(self.from_email),
                to_emails=To(email),
                subject=Subject(subject),
                plain_text_content=PlainTextContent(body)
            )
            
            # Send email
            response = self.sg.send(message)
            
            # Check response status
            if response.status_code in [200, 201, 202]:
                logger.info(f"Tech invitation email sent successfully to {email}")
                return True
            else:
                logger.error(f"SendGrid API returned status {response.status_code} for {email}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to send tech invitation email to {email}: {str(e)}")
            return False
    
    def is_configured(self) -> bool:
        """Check if SendGrid is properly configured"""
        return bool(self.api_key and self.from_email)

# Global email service instance
email_service = EmailService()
