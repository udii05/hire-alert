import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.agents.base import BaseAgent, get_user_profile
from app.models.models import Opportunity, Application, Notification, enum_value
from app.core.config import settings
from app.agents.recommendation import priority_bucket

logger = logging.getLogger(__name__)


class NotificationAgent(BaseAgent):
    """
    Alerts users when jobs enter the HIGH priority zone (deadline < 7 days)
    or when new high-match opportunities are discovered. Creates in-app
    notifications and sends email digests when SMTP is configured.
    """

    def __init__(self):
        super().__init__("NotificationAgent")
        self.email_enabled = settings.email_enabled
        self.smtp_host = settings.smtp_host
        self.smtp_port = settings.smtp_port
        self.smtp_user = settings.smtp_user
        self.smtp_password = settings.smtp_password
        self.email_from = settings.email_from
        self.app_url = settings.app_url

    async def execute(self, db: AsyncSession, **kwargs) -> Dict[str, Any]:
        """Generate and dispatch notifications."""
        await self.start_log(db, "send_notifications", kwargs)

        user_id = kwargs.get("user_id")
        if not user_id:
            return {"status": "skipped", "reason": "No user_id provided"}

        profile = await get_user_profile(db, user_id)
        if not profile.get("email"):
            return {"status": "skipped", "reason": "User not found"}

        now = datetime.utcnow()
        threshold = settings.match_threshold

        # Candidate opportunities: user's SAVED applications with fit score
        result = await db.execute(
            select(Application, Opportunity)
            .join(Opportunity, Application.opportunityId == Opportunity.id)
            .where(
                and_(
                    Application.userId == user_id,
                    Application.status == "SAVED",
                    Application.fitScore >= threshold,
                )
            )
        )
        candidates = []
        for app, opp in result.all():
            days_left = None
            if opp.deadline:
                deadline = opp.deadline.replace(tzinfo=None) if opp.deadline.tzinfo else opp.deadline
                days_left = (deadline - now).total_seconds() / 86400
            candidates.append({
                "app": app,
                "opp": opp,
                "days_left": days_left,
                "bucket": priority_bucket(days_left),
            })

        # Existing notification titles for dedup
        existing_result = await db.execute(
            select(Notification.title).where(
                and_(
                    Notification.userId == user_id,
                    Notification.createdAt >= now - timedelta(days=7),
                )
            )
        )
        existing_titles = {r[0] for r in existing_result.fetchall()}

        notifications_created = 0
        high_priority_emails = []

        for cand in candidates:
            opp = cand["opp"]
            app = cand["app"]
            bucket = cand["bucket"]
            days_left = cand["days_left"]

            if bucket == "HIGH":
                # --- Job entered HIGH priority zone: alert user (email + notification) ---
                saved_label = "⭐ Saved: " if app.status == "SAVED" else ""
                title = f"[HIGH] {saved_label}{opp.title}"
                if title not in existing_titles:
                    import uuid

                    if app.status == "SAVED":
                        message = (
                            f"Deadline approaching! You saved this job - {int(days_left)} day(s) left at {opp.company}. "
                            f"{int(app.fitScore)}% match - apply before it's too late!"
                        )
                        ntype = "SAVED_DEADLINE"
                    else:
                        message = (
                            f"Deadline in {int(days_left)} day(s) at {opp.company}. "
                            f"{int(app.fitScore)}% match - apply soon!"
                        )
                        ntype = "DEADLINE"

                    db.add(Notification(
                        id=str(uuid.uuid4()),
                        userId=user_id,
                        title=title,
                        message=message,
                        type=ntype,
                        link=f"/opportunities/{opp.id}",
                    ))
                    notifications_created += 1
                    existing_titles.add(title)
                high_priority_emails.append({
                    "title": opp.title,
                    "company": opp.company,
                    "location": opp.location,
                    "fit_score": app.fitScore,
                    "days_left": days_left,
                    "id": opp.id,
                    "url": opp.url,
                })
            elif bucket == "MEDIUM":
                # --- New medium-priority match: in-app notification only ---
                title = f"New match: {opp.title}"
                if title not in existing_titles:
                    import uuid
                    db.add(Notification(
                        id=str(uuid.uuid4()),
                        userId=user_id,
                        title=title,
                        message=f"{opp.company} - {int(app.fitScore)}% match, {int(days_left)} days left",
                        type="OPPORTUNITY",
                        link=f"/opportunities/{opp.id}",
                    ))
                    notifications_created += 1
                    existing_titles.add(title)

        await db.commit()

        # Email: one digest per cycle with high-priority jobs
        emails_sent = 0
        if self.email_enabled and high_priority_emails:
            email_result = await self._send_high_priority_alert(
                profile.get("email"), high_priority_emails
            )
            emails_sent = email_result.get("sent", 0)

        result = {
            "status": "completed",
            "notifications_created": notifications_created,
            "emails_sent": emails_sent,
            "high_priority_jobs": len(high_priority_emails),
        }

        await self.complete_log(db, output_data=result)
        return result

    async def _send_high_priority_alert(self, email: str, jobs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Send an email alert for high-priority jobs."""
        if not email or not self.email_enabled:
            return {"sent": 0}

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = f"Hire Alert: {len(jobs)} high-priority job(s) need your attention"
            msg["From"] = self.email_from
            msg["To"] = email
            msg.attach(MIMEText(self._build_email_html(jobs), "html"))

            with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=30) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            logger.info(f"High-priority alert email sent to {email}")
            return {"sent": 1}
        except Exception as e:
            logger.error(f"Failed to send high-priority email to {email}: {e}")
            return {"sent": 0, "error": str(e)}

    def _build_email_html(self, jobs: List[Dict[str, Any]]) -> str:
        cards = ""
        for job in jobs:
            days = int(job.get("days_left") or 0)
            cards += f"""
            <div style="border: 2px solid #ef4444; border-radius: 10px; padding: 16px; margin-bottom: 12px;">
                <h3 style="margin: 0 0 6px; color: #111;">{job['title']}</h3>
                <p style="margin: 0 0 6px; color: #555;">{job['company']} | {job.get('location') or 'N/A'}</p>
                <p style="margin: 0 0 8px; color: #b91c1c; font-weight: 600;">
                    Only {days} day(s) left to apply | {int(job.get('fit_score') or 0)}% match with your profile
                </p>
                <a href="{job.get('url') or self.app_url + '/opportunities/' + job['id']}"
                   style="background: #ef4444; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 13px;">
                    Apply Now
                </a>
            </div>
            """

        return f"""
        <!DOCTYPE html>
        <html>
        <head><meta charset="utf-8"><title>Hire Alert - High Priority Jobs</title></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
            <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #ef4444; margin: 0;">High Priority Alerts</h1>
                <p style="color: #6b7280; margin: 8px 0 0;">
                    {len(jobs)} job(s) matching your profile close within a week
                </p>
            </div>
            {cards}
            <div style="margin-top: 24px; text-align: center;">
                <a href="{self.app_url}/dashboard"
                   style="background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block;">
                    Open Dashboard
                </a>
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
                You're receiving this because you signed up for Hire Alert.<br>
                <a href="{self.app_url}/profile" style="color: #3b82f6;">Manage preferences</a>
            </p>
        </body>
        </html>
        """
