# Test Microsoft 365 SMTP Connection

# Quick test to see if basic auth works
import smtplib
from email.mime.text import MIMEText

smtp_server = "smtp.office365.com"
smtp_port = 587
username = "docsign@churchill.nsw.edu.au"
password = "YOUR_PASSWORD_HERE"  # Replace with actual password

try:
    print("Connecting to Microsoft 365 SMTP...")
    server = smtplib.SMTP(smtp_server, smtp_port)
    server.starttls()
    
    print("Attempting login...")
    server.login(username, password)
    
    print("✅ SUCCESS! SMTP authentication works!")
    print("You can use your regular password in docker-compose.yml")
    
    server.quit()
    
except smtplib.SMTPAuthenticationError as e:
    print(f"❌ Authentication failed: {e}")
    print("\nSolutions:")
    print("1. Contact IT to enable SMTP AUTH")
    print("2. Use SendGrid instead (recommended)")
    print("3. Create App Password if available")
    
except Exception as e:
    print(f"❌ Error: {e}")
