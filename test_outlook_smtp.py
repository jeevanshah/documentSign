import smtplib

print("Testing Microsoft 365 SMTP connection...\n")

smtp_server = "smtp.office365.com"
smtp_port = 587
username = "docsign@churchill.nsw.edu.au"
password = "Together@1431"

try:
    print(f"Connecting to {smtp_server}:{smtp_port}...")
    server = smtplib.SMTP(smtp_server, smtp_port, timeout=10)
    server.set_debuglevel(1)  # Show detailed output
    server.starttls()
    
    print("\nAttempting login...")
    server.login(username, password)
    
    print("\n" + "="*50)
    print("✅ SUCCESS! Your password works with SMTP!")
    print("="*50)
    print("\nNo app password needed - your regular password works.")
    print("The issue might be elsewhere. Check Documenso logs.")
    
    server.quit()
    
except smtplib.SMTPAuthenticationError as e:
    print("\n" + "="*50)
    print("❌ AUTHENTICATION FAILED")
    print("="*50)
    print(f"\nError: {e}")
    print("\n📝 Solutions:")
    print("1. Create an App Password:")
    print("   → https://account.microsoft.com/security")
    print("   → Security → App passwords → Create new")
    print("\n2. OR contact IT department to:")
    print("   → Enable SMTP AUTH for your account")
    print("   → Allow app passwords")
    print("\n3. OR use SendGrid (easiest):")
    print("   → Sign up: https://sendgrid.com/free")
    print("   → 100 emails/day free, no IT approval needed")
    
except Exception as e:
    print(f"\n❌ Connection Error: {e}")
    print("\nCheck if SMTP port 587 is blocked by firewall")
