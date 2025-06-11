import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import os
from jinja2 import Template

logger = logging.getLogger(__name__)

class EmailService:
    """Email service for sending invitations and notifications"""
    
    def __init__(self):
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.smtp_username = os.getenv("SMTP_USERNAME")
        self.smtp_password = os.getenv("SMTP_PASSWORD")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_username)
        self.from_name = os.getenv("FROM_NAME", "JobTicketInvoice")
        
    def _create_connection(self):
        """Create SMTP connection"""
        if not self.smtp_username or not self.smtp_password:
            raise ValueError("SMTP credentials not configured")
            
        server = smtplib.SMTP(self.smtp_server, self.smtp_port)
        server.starttls()
        server.login(self.smtp_username, self.smtp_password)
        return server
    
    def send_technician_invitation(
        self,
        to_email: str,
        technician_name: str,
        company_name: str,
        inviter_name: str,
        invitation_token: str,
        invitation_message: Optional[str] = None,
        frontend_url: str = "http://localhost:3000"
    ) -> bool:
        """Send technician invitation email"""
        try:
            # Create invitation URL
            invitation_url = f"{frontend_url}/accept-invitation?token={invitation_token}"
            
            # Email template
            html_template = Template("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Technician Invitation - {{ company_name }}</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background-color: #007bff; color: white; padding: 20px; text-align: center; }
                    .content { padding: 30px 20px; background-color: #f8f9fa; }
                    .button { 
                        display: inline-block; 
                        padding: 12px 30px; 
                        background-color: #28a745; 
                        color: white; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        margin: 20px 0;
                    }
                    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
                    .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>You're Invited to Join {{ company_name }}</h1>
                    </div>
                    
                    <div class="content">
                        <h2>Hello {{ technician_name }},</h2>
                        
                        <p>{{ inviter_name }} has invited you to join <strong>{{ company_name }}</strong> as a technician on the JobTicketInvoice platform.</p>
                        
                        {% if invitation_message %}
                        <div style="background-color: #e9ecef; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
                            <strong>Personal Message:</strong><br>
                            {{ invitation_message }}
                        </div>
                        {% endif %}
                        
                        <p>JobTicketInvoice is a comprehensive platform that allows you to:</p>
                        <ul>
                            <li>Submit daily job tickets from your mobile device</li>
                            <li>Track your work history and performance</li>
                            <li>Communicate with your manager efficiently</li>
                            <li>Access company resources and information</li>
                        </ul>
                        
                        <p>To accept this invitation and create your account, click the button below:</p>
                        
                        <div style="text-align: center;">
                            <a href="{{ invitation_url }}" class="button">Accept Invitation</a>
                        </div>
                        
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; background-color: #e9ecef; padding: 10px; border-radius: 3px;">
                            {{ invitation_url }}
                        </p>
                        
                        <div class="warning">
                            <strong>Important:</strong> This invitation will expire in 48 hours. Please accept it as soon as possible.
                        </div>
                        
                        <p>If you have any questions or need assistance, please contact {{ inviter_name }} or your company administrator.</p>
                        
                        <p>Welcome to the team!</p>
                    </div>
                    
                    <div class="footer">
                        <p>This invitation was sent by {{ company_name }} via JobTicketInvoice.</p>
                        <p>If you did not expect this invitation, please ignore this email.</p>
                    </div>
                </div>
            </body>
            </html>
            """)
            
            # Plain text version
            text_template = Template("""
            You're Invited to Join {{ company_name }}
            
            Hello {{ technician_name }},
            
            {{ inviter_name }} has invited you to join {{ company_name }} as a technician on the JobTicketInvoice platform.
            
            {% if invitation_message %}
            Personal Message:
            {{ invitation_message }}
            {% endif %}
            
            JobTicketInvoice is a comprehensive platform that allows you to:
            - Submit daily job tickets from your mobile device
            - Track your work history and performance
            - Communicate with your manager efficiently
            - Access company resources and information
            
            To accept this invitation and create your account, visit:
            {{ invitation_url }}
            
            Important: This invitation will expire in 48 hours. Please accept it as soon as possible.
            
            If you have any questions or need assistance, please contact {{ inviter_name }} or your company administrator.
            
            Welcome to the team!
            
            ---
            This invitation was sent by {{ company_name }} via JobTicketInvoice.
            If you did not expect this invitation, please ignore this email.
            """)
            
            # Render templates
            html_content = html_template.render(
                technician_name=technician_name,
                company_name=company_name,
                inviter_name=inviter_name,
                invitation_url=invitation_url,
                invitation_message=invitation_message
            )
            
            text_content = text_template.render(
                technician_name=technician_name,
                company_name=company_name,
                inviter_name=inviter_name,
                invitation_url=invitation_url,
                invitation_message=invitation_message
            )
            
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"Invitation to Join {company_name} - JobTicketInvoice"
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Attach text and HTML parts
            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            
            msg.attach(text_part)
            msg.attach(html_part)
            
            # Send email
            with self._create_connection() as server:
                server.send_message(msg)
            
            logger.info(f"Invitation email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send invitation email to {to_email}: {str(e)}")
            return False
    
    def send_password_reset_email(
        self,
        to_email: str,
        user_name: str,
        reset_token: str,
        frontend_url: str = "http://localhost:3000"
    ) -> bool:
        """Send password reset email"""
        try:
            reset_url = f"{frontend_url}/reset-password?token={reset_token}"
            
            html_content = f"""
            <html>
            <body>
                <h2>Password Reset Request</h2>
                <p>Hello {user_name},</p>
                <p>You have requested to reset your password for your JobTicketInvoice account.</p>
                <p>Click the link below to reset your password:</p>
                <p><a href="{reset_url}">Reset Password</a></p>
                <p>This link will expire in 1 hour.</p>
                <p>If you did not request this password reset, please ignore this email.</p>
            </body>
            </html>
            """
            
            text_content = f"""
            Password Reset Request
            
            Hello {user_name},
            
            You have requested to reset your password for your JobTicketInvoice account.
            
            Visit this link to reset your password:
            {reset_url}
            
            This link will expire in 1 hour.
            
            If you did not request this password reset, please ignore this email.
            """
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = "Password Reset - JobTicketInvoice"
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            text_part = MIMEText(text_content, 'plain')
            html_part = MIMEText(html_content, 'html')
            
            msg.attach(text_part)
            msg.attach(html_part)
            
            with self._create_connection() as server:
                server.send_message(msg)
            
            logger.info(f"Password reset email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send password reset email to {to_email}: {str(e)}")
            return False

# Global email service instance
email_service = EmailService()

def send_invitation_email(
    to_email: str,
    technician_name: str,
    company_name: str,
    inviter_name: str,
    invitation_token: str,
    invitation_message: Optional[str] = None
) -> bool:
    """Convenience function to send invitation email"""
    return email_service.send_technician_invitation(
        to_email=to_email,
        technician_name=technician_name,
        company_name=company_name,
        inviter_name=inviter_name,
        invitation_token=invitation_token,
        invitation_message=invitation_message
    )

def send_password_reset(
    to_email: str,
    user_name: str,
    reset_token: str
) -> bool:
    """Convenience function to send password reset email"""
    return email_service.send_password_reset_email(
        to_email=to_email,
        user_name=user_name,
        reset_token=reset_token
    )
