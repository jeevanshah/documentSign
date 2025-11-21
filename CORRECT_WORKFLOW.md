# Documenso API - Correct Workflow

## The Issue
The error "Create document is not available without S3 transport" occurs because Documenso uses a **two-step upload process**:
1. Create document → Get presigned upload URL
2. Upload PDF to that URL

## Correct 4-Step Process

### Step 1: Create Document
```bash
POST http://localhost:3000/api/v1/documents
Authorization: Bearer api_zp6muo4z1s7dalie
Content-Type: application/json

{
  "title": "Contract for Signing",
  "recipients": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "role": "SIGNER"
    }
  ]
}
```

**Response:**
```json
{
  "uploadUrl": "http://minio:9000/documenso/...",
  "documentId": 1,
  "recipients": [
    {
      "recipientId": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "token": "abc123...",
      "signingUrl": "http://localhost:3000/sign/..."
    }
  ]
}
```

Save: `uploadUrl`, `documentId`, `recipientId`

### Step 2: Upload PDF
```bash
PUT <uploadUrl from step 1>
Content-Type: application/pdf

[Binary PDF data]
```

**In Postman:**
- Use the `uploadUrl` from Step 1 response
- Method: PUT
- Headers: `Content-Type: application/pdf`
- Body → Binary → Select your PDF file

**In curl:**
```bash
curl -X PUT "http://localhost:3000/..." \
  -H "Content-Type: application/pdf" \
  --data-binary "@your-document.pdf"
```

### Step 3: Add Signature Fields
```bash
POST http://localhost:3000/api/v1/documents/{documentId}/fields
Authorization: Bearer api_zp6muo4z1s7dalie
Content-Type: application/json

[
  {
    "recipientId": 1,
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
  },
  {
    "recipientId": 1,
    "type": "DATE",
    "pageNumber": 1,
    "pageX": 100,
    "pageY": 400,
    "pageWidth": 150,
    "pageHeight": 30,
    "fieldMeta": {
      "type": "date",
      "label": "Date",
      "required": true
    }
  }
]
```

### Step 4: Send Document
```bash
POST http://localhost:3000/api/v1/documents/{documentId}/send
Authorization: Bearer api_zp6muo4z1s7dalie
Content-Type: application/json

{
  "sendEmail": false
}
```

**Response includes signing URLs:**
```json
{
  "message": "Document sent",
  "recipients": [
    {
      "name": "John Doe",
      "signingUrl": "http://localhost:3000/sign/abc123..."
    }
  ]
}
```

## Using the Scripts

### Node.js
```bash
node create-document-complete.js path/to/your/document.pdf
```

### Python
```bash
python create-document-complete.py path/to/your/document.pdf
```

## Using Postman Collection

Import `Documenso_API.postman_collection.json` and follow these steps:

1. **Run "1. Create Document"** - This saves `documentId`, `uploadUrl`, and `recipientId` to collection variables
2. **Run "2. Upload PDF"**:
   - The URL is automatically set to `{{uploadUrl}}`
   - Body → Binary → Select your PDF file
3. **Run "3. Add Signature Fields"** - Uses saved `documentId` and `recipientId`
4. **Run "4. Send Document"** - Uses saved `documentId`

## Field Types and Coordinates

### Field Types
- `SIGNATURE` - Signature field
- `INITIALS` - Initials field
- `NAME` - Name field
- `EMAIL` - Email field
- `DATE` - Date field
- `TEXT` - Text input field
- `NUMBER` - Number input field

### Coordinate System
- `pageNumber`: Page number (starts at 1)
- `pageX`: Horizontal position from left (pixels)
- `pageY`: Vertical position from **bottom** (not top!)
- `pageWidth`: Field width (pixels)
- `pageHeight`: Field height (pixels)

**Example positions for US Letter (612x792):**
- Top of page: `pageY: 742` (792 - 50)
- Middle: `pageY: 396` (792 / 2)
- Bottom: `pageY: 50`

## Common Issues

### ❌ "Create document is not available without S3 transport"
- **Cause:** Trying to send PDF data in the create request
- **Solution:** Use the 2-step process (create → upload to presigned URL)

### ❌ "Document not found" when adding fields
- **Cause:** Document creation failed or upload didn't complete
- **Solution:** Check Step 1 and Step 2 responses for errors

### ❌ Fields not appearing
- **Cause:** Incorrect coordinates or pageNumber
- **Solution:** 
  - Ensure `pageNumber` starts at 1 (not 0)
  - Remember `pageY` is from **bottom** of page
  - Check your PDF dimensions

### ❌ Upload fails with 403/404
- **Cause:** Upload URL expired or incorrect
- **Solution:** The presigned URL is time-limited. Create a new document if it expired.

## Environment Variables

Your current setup:
- **API URL:** http://localhost:3000
- **API Token:** api_zp6muo4z1s7dalie
- **MinIO:** http://localhost:9000
- **Bucket:** documenso

All working correctly! ✓
