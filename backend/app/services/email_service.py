"""
Email service using Gmail SMTP.
Sends branded screening form invitations to candidates to any email address.
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import uuid
from app.config import get_settings

settings = get_settings()

def send_form_invitation(
    candidate_email: str,
    candidate_name: str,
    job_title: str,
    session_id: str,
) -> dict:
    """Send a branded screening form invitation email using Gmail SMTP."""
    form_url = f"{settings.app_url}/form/{session_id}"

    html_body = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:'Inter',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0F;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#16161F;border:1px solid #1E1E2A;border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#5B21B6,#7C3AED);padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:10px;display:inline-flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#fff;margin-bottom:16px;">C</div>
                    <h1 style="margin:0;font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Catalyst Talent</h1>
                    <p style="margin:4px 0 0;font-size:14px;color:rgba(255,255,255,0.7);">AI-Powered Recruitment</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#F8F8FF;">Hi {candidate_name},</h2>
              <p style="margin:0 0 24px;font-size:15px;color:#8888A8;line-height:1.7;">
                You have been shortlisted for an exciting opportunity! A recruiter using Catalyst AI
                would like you to complete a brief screening form for the role of
                <strong style="color:#A78BFA;">{job_title}</strong>.
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#8888A8;line-height:1.7;">
                The form takes about <strong style="color:#F8F8FF;">3–5 minutes</strong> to complete.
                Your responses will be reviewed by our AI and then by the hiring team.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background:linear-gradient(135deg,#7C3AED,#5B21B6);border-radius:12px;">
                    <a href="{form_url}"
                       style="display:inline-block;padding:16px 40px;font-size:16px;font-weight:700;color:#fff;text-decoration:none;letter-spacing:0.02em;">
                      Open Screening Form →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link fallback -->
              <p style="margin:0 0 8px;font-size:12px;color:#52526E;">Or copy this link into your browser:</p>
              <p style="margin:0 0 32px;font-size:12px;color:#A78BFA;word-break:break-all;">{form_url}</p>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #1E1E2A;margin:0 0 24px;"/>

              <p style="margin:0;font-size:12px;color:#52526E;line-height:1.6;">
                This link is valid for <strong>24 hours</strong>. If you did not expect this email,
                you can safely ignore it. This message was sent via Catalyst AI on behalf of the hiring team.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0F0F17;padding:20px 40px;border-top:1px solid #1E1E2A;">
              <p style="margin:0;font-size:12px;color:#3A3A50;text-align:center;">
                Powered by <strong style="color:#7C3AED;">Catalyst AI</strong> · AI Talent Scouting Platform
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    msg = MIMEMultipart()
    msg['From'] = "Catalyst Talent <saigowtham05peddinti@gmail.com>"
    msg['To'] = candidate_email
    msg['Subject'] = f"You've been shortlisted — {job_title} Screening Form"
    msg.attach(MIMEText(html_body, 'html'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        # Using Gmail App Password to bypass Resend restrictions
        server.login("saigowtham05peddinti@gmail.com", "jrmehffrrogwivrp")
        server.send_message(msg)
        server.quit()
        return {"id": str(uuid.uuid4()), "status": "sent"}
    except Exception as e:
        print(f"[EMAIL ERROR] {e}")
        raise
