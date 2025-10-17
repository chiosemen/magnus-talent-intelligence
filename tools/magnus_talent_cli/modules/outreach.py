import smtplib, ssl, os
from email.mime.text import MIMEText
def send_email(subject, body, to_email):
    msg = MIMEText(body, "plain")
    msg["Subject"] = subject
    msg["From"] = os.getenv("OUTREACH_FROM")
    msg["To"] = to_email
    context = ssl.create_default_context()
    with smtplib.SMTP_SSL(os.getenv("SMTP_HOST"), int(os.getenv("SMTP_PORT")), context=context) as server:
        server.login(os.getenv("SMTP_USER"), os.getenv("SMTP_PASS"))
        server.sendmail(msg["From"], [to_email], msg.as_string())
    return "sent"
