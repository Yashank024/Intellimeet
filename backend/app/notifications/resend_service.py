import os
import logging
import resend

logger = logging.getLogger("IntelliMeet.ResendService")

class ResendService:
    def __init__(self):
        self.api_key = os.getenv("RESEND_API_KEY")
        if self.api_key:
            resend.api_key = self.api_key
            logger.info("Resend API key initialized.")
        else:
            logger.warning("RESEND_API_KEY is not set. Email delivery will be simulated.")

    def send_email(self, recipient_email: str, subject: str, html_body: str) -> bool:
        if not self.api_key:
            logger.info(f"[SIMULATION] Sending email to {recipient_email} | Subject: {subject}")
            return True
            
        try:
            logger.info(f"Attempting to dispatch email to {recipient_email} using Resend API...")
            params = {
                "from": "IntelliMeet <onboarding@resend.dev>",
                "to": recipient_email,
                "subject": subject,
                "html": html_body
            }
            response = resend.Emails.send(params)
            logger.info(f"Resend email sent successfully. ID: {response.get('id')}")
            return True
        except Exception as e:
            logger.warning(f"Resend API call failed: {e}. Logging notification and falling back to simulation.")
            logger.info(f"[SIMULATED FALLBACK] Email to {recipient_email} | Subject: {subject}")
            return True
