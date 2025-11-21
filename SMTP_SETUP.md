# SMTP Configuration Guide

## Gmail Setup (Easiest for Testing)

1. Enable 2-Factor Authentication:
   - Go to https://myaccount.google.com/security
   - Turn on 2-Step Verification

2. Generate App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Documenso"
   - Copy the 16-character password (e.g., "abcd efgh ijkl mnop")

3. Update docker-compose.yml with your details:
   - NEXT_PRIVATE_SMTP_FROM_ADDRESS=your-email@gmail.com
   - NEXT_PRIVATE_SMTP_USERNAME=your-email@gmail.com
   - NEXT_PRIVATE_SMTP_PASSWORD=abcdefghijklmnop (remove spaces)

4. Restart containers:
   docker-compose down
   docker-compose up -d

5. Test by setting sendEmail: true in your API requests

## SendGrid Setup (Recommended for Production)

Free tier: 100 emails/day

1. Sign up at https://sendgrid.com
2. Verify your sender email address
3. Create API Key:
   - Settings → API Keys → Create API Key
   - Choose "Restricted Access" and enable "Mail Send"
   - Copy the API key (starts with "SG.")

4. Update docker-compose.yml:
   - NEXT_PRIVATE_SMTP_TRANSPORT=smtp-api
   - NEXT_PRIVATE_SMTP_HOST=smtp.sendgrid.net
   - NEXT_PRIVATE_SMTP_APIKEY=SG.your-api-key-here

## Resend Setup (Modern Alternative)

Free tier: 3,000 emails/month

1. Sign up at https://resend.com
2. Add and verify your domain (or use their test domain)
3. Create API Key
4. Update docker-compose.yml:
   - NEXT_PRIVATE_SMTP_TRANSPORT=resend
   - NEXT_PRIVATE_RESEND_API_KEY=re_your-api-key-here

## Testing SMTP

After configuring, test by sending a document:

```python
# In your FastAPI or test script
request = {
    "title": "Test Document",
    "recipients": [{"name": "Test", "email": "test@example.com"}],
    "sendEmail": True  # <-- Set to true
}
```

Check Documenso logs:
```bash
docker logs documenso-app -f
```

Look for successful email send messages.

## Troubleshooting

### Gmail: "Username and Password not accepted"
- Make sure you're using the App Password, not your regular password
- Remove spaces from the app password
- Ensure 2FA is enabled

### SendGrid: "Unauthorized"
- Verify API key has "Mail Send" permission
- Check sender email is verified

### Email not received
- Check spam folder
- Verify recipient email is correct
- Check Documenso logs for errors
- Test with a different email provider

## Production Recommendations

1. **SendGrid** - Best for most use cases
2. **Resend** - Best for modern apps
3. **AWS SES** - Best for high volume (cheapest at scale)
4. **Gmail** - Only for development/testing
