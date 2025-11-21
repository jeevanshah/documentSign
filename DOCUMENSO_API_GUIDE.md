# Documenso API Guide for Postman

## Step 1: Get Your API Token

1. Go to: http://localhost:3000/settings/tokens
2. Click "Create Token"
3. Name it (e.g., "Postman API")
4. Copy the token that appears (you'll only see it once!)

## Step 2: Configure Postman

### Headers for all requests:
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

## Common API Endpoints

### 1. Create a Document

**POST** `http://localhost:3000/api/v1/documents`

**Body (JSON):**
```json
{
  "title": "Test Contract",
  "recipients": [
    {
      "email": "signer@example.com",
      "name": "John Doe",
      "role": "SIGNER"
    }
  ],
  "file": {
    "name": "contract.pdf",
    "content": "BASE64_ENCODED_PDF_CONTENT_HERE"
  },
  "fields": [
    {
      "type": "SIGNATURE",
      "page": 0,
      "x": 100,
      "y": 200,
      "width": 200,
      "height": 50,
      "recipientId": 0
    }
  ]
}
```

### 2. Get All Documents

**GET** `http://localhost:3000/api/v1/documents`

### 3. Get Document by ID

**GET** `http://localhost:3000/api/v1/documents/{documentId}`

### 4. Send Document for Signature

**POST** `http://localhost:3000/api/v1/documents/{documentId}/send`

### 5. Create Template

**POST** `http://localhost:3000/api/v1/templates`

**Body (JSON):**
```json
{
  "title": "Contract Template",
  "file": {
    "name": "template.pdf",
    "content": "BASE64_ENCODED_PDF_CONTENT_HERE"
  },
  "fields": [
    {
      "type": "SIGNATURE",
      "page": 0,
      "x": 100,
      "y": 200,
      "width": 200,
      "height": 50,
      "recipientRole": "Signer"
    },
    {
      "type": "DATE",
      "page": 0,
      "x": 100,
      "y": 300,
      "width": 150,
      "height": 30,
      "recipientRole": "Signer"
    }
  ]
}
```

## Field Types Available:

- `SIGNATURE` - Signature field
- `DATE` - Date field
- `TEXT` - Text input field
- `EMAIL` - Email field
- `NAME` - Name field
- `NUMBER` - Number field

## Example: Complete Postman Request

### Create Document with Multiple Signature Fields

**Endpoint:** `POST http://localhost:3000/api/v1/documents`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Multi-Signature Contract",
  "recipients": [
    {
      "email": "client@example.com",
      "name": "Client Name",
      "role": "SIGNER"
    },
    {
      "email": "witness@example.com",
      "name": "Witness Name",
      "role": "SIGNER"
    }
  ],
  "file": {
    "name": "contract.pdf",
    "content": "JVBERi0xLjQKJeLjz9MKNSAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDQgMCBSL01lZGlhQm94WzAgMCA2MTIgNzkyXS9Db250ZW50cyAzIDAgUi9SZXNvdXJjZXM8PC9Gb250PDwvRjEgMiAwIFI+Pj4+Pj4KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZS9QYWdlcy9Db3VudCAxL0tpZHNbNSAwIFJdPj4KZW5kb2JqCjMgMCBvYmoKPDwvTGVuZ3RoIDQ0Pj4Kc3RyZWFtCkJUCi9GMSA5LjYgVGYKMTAgNzAwIFRkCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoyIDAgb2JqCjw8L1R5cGUvRm9udC9TdWJ0eXBlL1R5cGUxL0Jhc2VGb250L0hlbHZldGljYT4+CmVuZG9iagoxIDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYWdlcyA0IDAgUj4+CmVuZG9iagp4cmVmCjAgNgowMDAwMDAwMDAwIDY1NTM1IGYKMDAwMDAwMDMxNiAwMDAwMCBuCjAwMDAwMDAyNjUgMDAwMDAgbgowMDAwMDAwMTY3IDAwMDAwIG4KMDAwMDAwMDExOCAwMDAwMCBuCjAwMDAwMDAwMTUgMDAwMDAgbgp0cmFpbGVyCjw8L1NpemUgNi9Sb290IDEgMCBSPj4Kc3RhcnR4cmVmCjM2NQolJUVPRgo="
  },
  "fields": [
    {
      "type": "SIGNATURE",
      "page": 0,
      "x": 100,
      "y": 600,
      "width": 200,
      "height": 60,
      "recipientId": 0
    },
    {
      "type": "DATE",
      "page": 0,
      "x": 320,
      "y": 600,
      "width": 150,
      "height": 40,
      "recipientId": 0
    },
    {
      "type": "SIGNATURE",
      "page": 0,
      "x": 100,
      "y": 500,
      "width": 200,
      "height": 60,
      "recipientId": 1
    }
  ]
}
```

## Tips:

1. **Convert PDF to Base64:**
   - Use: https://base64.guru/converter/encode/pdf
   - Or use a script to convert your PDF

2. **Coordinate System:**
   - `x, y` - Position from top-left corner
   - `width, height` - Size of the field
   - `page` - Page number (starts from 0)

3. **Test with a Simple PDF:**
   - The base64 string in the example above is a minimal valid PDF
   - Use this for testing before uploading your real documents

4. **Check API Documentation:**
   - Visit: http://localhost:3000/api/v1/docs (if available)
   - Or check: https://docs.documenso.com/developers/api
