# ✅ SOLUTION - API Now Working!

## The Problem

Documenso API was returning:
```json
{"message":"Create document is not available without S3 transport."}
```

## The Root Cause

Documenso requires **TWO environment variables** for S3, not one:
- `NEXT_PUBLIC_UPLOAD_TRANSPORT=s3` (checked by API code)
- `NEXT_PRIVATE_UPLOAD_TRANSPORT=s3` (checked by upload code)

You only had `NEXT_PRIVATE_UPLOAD_TRANSPORT` set!

## The Fix

Added this line to docker-compose.yml:
```yaml
- NEXT_PUBLIC_UPLOAD_TRANSPORT=s3
```

## Verified Working

```bash
node test-api.js
```

Output:
```
✓ Document created successfully!
  Document ID: 3
  Recipient ID: 2
  Upload URL: http://minio:9000/documenso/...
```

## Complete Working Workflow

### 1. Create Document (Get Upload URL)
```bash
curl -X POST http://localhost:3000/api/v1/documents \
  -H "Authorization: Bearer api_zp6muo4z1s7dalie" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Contract for Signing",
    "recipients": [
      {
        "name": "John Doe",
        "email": "john@example.com",
        "role": "SIGNER"
      }
    ]
  }'
```

**Response:**
```json
{
  "uploadUrl": "http://minio:9000/documenso/...",
  "documentId": 3,
  "recipients": [...]
}
```

### 2. Upload PDF to URL
```bash
curl -X PUT "<uploadUrl from step 1>" \
  -H "Content-Type: application/pdf" \
  --data-binary "@your-document.pdf"
```

### 3. Add Signature Fields
```bash
curl -X POST http://localhost:3000/api/v1/documents/3/fields \
  -H "Authorization: Bearer api_zp6muo4z1s7dalie" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "recipientId": 2,
      "type": "SIGNATURE",
      "pageNumber": 1,
      "pageX": 100,
      "pageY": 500,
      "pageWidth": 200,
      "pageHeight": 60,
      "fieldMeta": {
        "type": "signature",
        "label": "Signature",
        "required": true
      }
    }
  ]'
```

### 4. Send Document
```bash
curl -X POST http://localhost:3000/api/v1/documents/3/send \
  -H "Authorization: Bearer api_zp6muo4z1s7dalie" \
  -H "Content-Type: application/json" \
  -d '{
    "sendEmail": false
  }'
```

## Use the Scripts

### Node.js
```bash
node create-document-complete.js path/to/your/document.pdf
```

### Python
```bash
python create-document-complete.py path/to/your/document.pdf
```

## Postman Collection

Import `Documenso_API.postman_collection.json` and run requests 1-4 in order.

## All Working Now! ✅

- ✅ Documenso API
- ✅ S3 (MinIO) storage
- ✅ Document creation
- ✅ PDF upload via presigned URL
- ✅ Signature field placement
- ✅ Document sending

## Cost Comparison

Since DocuSeal charges for API access, using Documenso is **100% FREE** for all features including:
- Unlimited API access
- Unlimited documents
- Multiple signature fields
- S3 storage
- Self-hosted solution

Your setup is now fully operational and completely free!
