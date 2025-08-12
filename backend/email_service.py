import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings
from typing import Optional

class EmailService:
    def __init__(self):
        self.smtp_server = settings.smtp_server
        self.smtp_port = settings.smtp_port
        self.smtp_username = settings.smtp_username
        self.smtp_password = settings.smtp_password
        self.from_email = settings.from_email

    def send_verification_email(self, email: str, token: str, base_url: str = "http://localhost:3000") -> bool:
        """Send email verification link"""
        try:
            verification_url = f"{base_url}/verify?token={token}"
            
            subject = "Verify Your Email - Vehicle Rental System"
            body = f"""
            <html>
            <body>
                <h2>Welcome to Vehicle Rental System!</h2>
                <p>Please click the link below to verify your email address:</p>
                <p><a href="{verification_url}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">Verify Email</a></p>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p>{verification_url}</p>
                <p>This link will expire in 24 hours.</p>
                <p>Best regards,<br>Vehicle Rental Team</p>
            </body>
            </html>
            """
            
            return self._send_email(email, subject, body)
        except Exception as e:
            print(f"Error sending verification email: {e}")
            return False

    def send_password_reset_email(self, email: str, token: str, base_url: str = "http://localhost:3000") -> bool:
        """Send password reset email"""
        try:
            reset_url = f"{base_url}/reset-password?token={token}"
            
            subject = "Reset Your Password - Vehicle Rental System"
            body = f"""
            <html>
            <body>
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password. Click the link below to proceed:</p>
                <p><a href="{reset_url}" style="background-color: #ff6b6b; color: white; padding: 14px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
                <p>If you didn't request this, please ignore this email.</p>
                <p>This link will expire in 1 hour.</p>
                <p>Best regards,<br>Vehicle Rental Team</p>
            </body>
            </html>
            """
            
            return self._send_email(email, subject, body)
        except Exception as e:
            print(f"Error sending password reset email: {e}")
            return False

    def _send_email(self, to_email: str, subject: str, body: str) -> bool:
        """Send email using SMTP"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email
            
            html_part = MIMEText(body, 'html')
            msg.attach(html_part)
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            return True
        except Exception as e:
            print(f"Error sending email: {e}")
            return False

# Create email service instance
email_service = EmailService()
