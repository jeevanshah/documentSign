# Documenso Document Signing System

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js installed (for running scripts)

### 1. Start Documenso

```powershell
docker-compose up -d
```

Access Documenso at: http://localhost:3000

### 2. Get Your API Token

1. Go to http://localhost:3000/settings/tokens
2. Create a new API token
3. Update the token in the scripts:
   - `send-bbis-document.js` (line 4)
   - `create-bbis-document.js` (line 4)
   - `create-document-complete.js` (line 3)

## 📄 Main Scripts

### `send-bbis-document.js` - **RECOMMENDED**
Complete document workflow with student + witness signatures

**Features:**
- 2 recipients (student + witness)
- Initials + date on all 8 pages
- Name, signature, date fields on page 5 for both recipients
- Enhanced field metadata (labels, placeholders, font sizes)
- 22 total fields

**Usage:**
```powershell
node send-bbis-document.js
```

**Configuration:**
- Line 4: API Token
- Line 5: PDF Path
- Lines 60-68: Student recipient details
- Lines 69-77: Witness recipient details

### `create-bbis-document.js`
Single recipient document (student only)

**Features:**
- 1 recipient (student)
- Initials + date on all 8 pages
- Name, signature, date fields on page 5
- 19 total fields

**Usage:**
```powershell
node create-bbis-document.js
```

### `create-document-complete.js`
Simple example with basic signature fields

**Usage:**
```powershell
node create-document-complete.js <path-to-pdf>
```

## 🎯 Field Coordinates (Page 5)

### Student Fields
- **Name:** X: 63, Y: 34, Width: 30, Height: 2.5
- **Signature:** X: 72, Y: 38, Width: 25, Height: 3
- **Date:** X: 56, Y: 39, Width: 15, Height: 1.5

### Witness Fields
- **Name:** X: 63, Y: 48, Width: 30, Height: 2.5
- **Signature:** X: 67, Y: 51, Width: 30, Height: 3
- **Date:** X: 56, Y: 53, Width: 15, Height: 1.5

### Initials/Date (All Pages)
- **Initials:** X: 72, Y: 92, Width: 3, Height: 1.5
- **Date:** X: 81, Y: 92, Width: 4, Height: 1.5

## 🔧 Field Metadata

All fields include enhanced metadata:

```javascript
fieldMeta: {
  type: 'signature',        // Field type
  label: 'Student Signature', // Display label
  placeholder: 'Sign here',   // Placeholder text (for text fields)
  required: true,            // Mandatory field
  fontSize: 14               // Font size (8-96)
}
```

## 📱 Mobile Support

Documents work on mobile devices with:
- Touch-based signature drawing
- Responsive field layouts
- Mobile-optimized date pickers
- Clear labels and placeholders

## 🐳 Docker Services

- **Documenso:** Main application (port 3000)
- **PostgreSQL:** Database (port 5432)
- **MinIO:** Document storage (ports 9000, 9001)

### MinIO Console
Access at: http://localhost:9001
- Username: `minioadmin`
- Password: `minioadmin`

## 📧 Email Configuration

SMTP configured for Microsoft 365:
- Host: smtp.office365.com
- Port: 587
- Username: docsign@churchill.nsw.edu.au
- Password: [configured in docker-compose.yml]

## 🛠️ Useful Commands

### Check Docker Status
```powershell
docker-compose ps
```

### View Logs
```powershell
docker-compose logs -f documenso
```

### Restart Services
```powershell
docker-compose restart
```

### Stop All Services
```powershell
docker-compose down
```

### Reset Everything
```powershell
docker-compose down -v
docker-compose up -d
```

## 📚 Additional Resources

- **DOCUMENSO_API_GUIDE.md** - API documentation
- **TEMPLATE_GUIDE.md** - Template creation guide
- **SMTP_SETUP.md** - Email configuration guide
- **coordinate-finder.html** - Visual tool to find field coordinates
- **Documenso_API.postman_collection.json** - Postman collection for API testing

## 🎓 Example Workflow

1. Start Docker: `docker-compose up -d`
2. Get API token from http://localhost:3000/settings/tokens
3. Update token in `send-bbis-document.js`
4. Update PDF path (line 5)
5. Update recipient emails (lines 62, 71)
6. Run: `node send-bbis-document.js`
7. Use the signing URLs provided in the output

## 🔑 Important Notes

- Always use the `/sign/TOKEN` URL for signing (not `/documents/ID`)
- Fields support labels, placeholders, and custom font sizes via `fieldMeta`
- Signature and name fields automatically adjust height to prevent text cutoff
- Date fields auto-populate with current date/time
- All scripts use Docker container upload method for reliability

## 📝 License

This is a project setup for Churchill document signing using Documenso.
