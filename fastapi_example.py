from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import httpx
import asyncio

app = FastAPI(title="Documenso Integration API")

# Documenso configuration
DOCUMENSO_URL = "http://localhost:3000"
DOCUMENSO_API_TOKEN = "api_jv5z81lxghwwuiaf"

# Request models
class Recipient(BaseModel):
    name: str
    email: EmailStr
    role: str = "SIGNER"

class SignatureField(BaseModel):
    type: str  # SIGNATURE, DATE, NAME, EMAIL, TEXT, etc.
    pageNumber: int
    pageX: float
    pageY: float
    pageWidth: float
    pageHeight: float
    label: Optional[str] = None
    required: bool = True

class CreateDocumentRequest(BaseModel):
    title: str
    recipients: List[Recipient]
    subject: Optional[str] = "Please sign this document"
    message: Optional[str] = "Review and sign the attached document"
    signatureFields: List[SignatureField]
    sendEmail: bool = False


# Response model
class SigningResponse(BaseModel):
    documentId: int
    signingUrls: List[dict]
    message: str


@app.post("/api/documents/create-and-sign", response_model=SigningResponse)
async def create_document_for_signing(
    request: CreateDocumentRequest,
    file: UploadFile = File(...)
):
    """
    Complete workflow: Upload PDF, add signature fields, and generate signing URLs
    
    Example request:
    POST /api/documents/create-and-sign
    Content-Type: multipart/form-data
    
    Form data:
    - file: PDF file
    - request: JSON with title, recipients, signatureFields
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            
            # STEP 1: Create document in Documenso
            print(f"Step 1: Creating document '{request.title}'...")
            create_payload = {
                "title": request.title,
                "recipients": [r.dict() for r in request.recipients],
                "meta": {
                    "subject": request.subject,
                    "message": request.message
                }
            }
            
            create_response = await client.post(
                f"{DOCUMENSO_URL}/api/v1/documents",
                headers={
                    "Authorization": f"Bearer {DOCUMENSO_API_TOKEN}",
                    "Content-Type": "application/json"
                },
                json=create_payload
            )
            
            if create_response.status_code != 200:
                raise HTTPException(
                    status_code=create_response.status_code,
                    detail=f"Failed to create document: {create_response.text}"
                )
            
            create_data = create_response.json()
            document_id = create_data["id"]
            upload_url = create_data["uploadUrl"]
            recipients_data = create_data["recipients"]
            
            print(f"✓ Document created with ID: {document_id}")
            
            # STEP 2: Upload PDF to presigned URL
            print("Step 2: Uploading PDF...")
            pdf_content = await file.read()
            
            upload_response = await client.put(
                upload_url,
                headers={"Content-Type": "application/pdf"},
                content=pdf_content
            )
            
            if upload_response.status_code not in [200, 204]:
                raise HTTPException(
                    status_code=upload_response.status_code,
                    detail=f"Failed to upload PDF: {upload_response.text}"
                )
            
            print("✓ PDF uploaded successfully")
            
            # STEP 3: Add signature fields
            print(f"Step 3: Adding {len(request.signatureFields)} signature fields...")
            
            # Map fields to recipients
            fields_payload = []
            for field in request.signatureFields:
                # Use first recipient's ID (you can customize this logic)
                recipient_id = recipients_data[0]["id"]
                
                field_data = {
                    "recipientId": recipient_id,
                    "type": field.type,
                    "pageNumber": field.pageNumber,
                    "pageX": field.pageX,
                    "pageY": field.pageY,
                    "pageWidth": field.pageWidth,
                    "pageHeight": field.pageHeight
                }
                
                # Add fieldMeta for advanced field types
                if field.type in ["TEXT", "NUMBER", "CHECKBOX", "DROPDOWN", "RADIO"]:
                    field_data["fieldMeta"] = {
                        "type": field.type.lower(),
                        "label": field.label or field.type,
                        "required": field.required
                    }
                
                fields_payload.append(field_data)
            
            fields_response = await client.post(
                f"{DOCUMENSO_URL}/api/v1/documents/{document_id}/fields",
                headers={
                    "Authorization": f"Bearer {DOCUMENSO_API_TOKEN}",
                    "Content-Type": "application/json"
                },
                json=fields_payload
            )
            
            if fields_response.status_code != 200:
                raise HTTPException(
                    status_code=fields_response.status_code,
                    detail=f"Failed to add fields: {fields_response.text}"
                )
            
            print("✓ Signature fields added")
            
            # STEP 4: Send document (finalize)
            print("Step 4: Sending document...")
            send_response = await client.post(
                f"{DOCUMENSO_URL}/api/v1/documents/{document_id}/send",
                headers={
                    "Authorization": f"Bearer {DOCUMENSO_API_TOKEN}",
                    "Content-Type": "application/json"
                },
                json={"sendEmail": request.sendEmail}
            )
            
            if send_response.status_code != 200:
                raise HTTPException(
                    status_code=send_response.status_code,
                    detail=f"Failed to send document: {send_response.text}"
                )
            
            print("✓ Document ready for signing")
            
            # Build response with signing URLs
            signing_urls = [
                {
                    "recipientName": r["name"],
                    "recipientEmail": r["email"],
                    "signingUrl": r["signingUrl"]
                }
                for r in recipients_data
            ]
            
            return SigningResponse(
                documentId=document_id,
                signingUrls=signing_urls,
                message="Document created and ready for signing"
            )
            
    except httpx.HTTPError as e:
        raise HTTPException(status_code=500, detail=f"HTTP error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


@app.post("/api/documents/quick-sign")
async def quick_sign_document(
    title: str,
    recipient_name: str,
    recipient_email: EmailStr,
    file: UploadFile = File(...)
):
    """
    Simplified endpoint: Upload PDF with default signature field positions
    
    Example:
    POST /api/documents/quick-sign?title=Contract&recipient_name=John&recipient_email=john@example.com
    Content-Type: multipart/form-data
    Body: PDF file
    """
    # Default signature fields
    default_fields = [
        SignatureField(
            type="SIGNATURE",
            pageNumber=1,
            pageX=100,
            pageY=200,
            pageWidth=200,
            pageHeight=60,
            label="Signature"
        ),
        SignatureField(
            type="DATE",
            pageNumber=1,
            pageX=100,
            pageY=150,
            pageWidth=150,
            pageHeight=30,
            label="Date"
        ),
        SignatureField(
            type="NAME",
            pageNumber=1,
            pageX=100,
            pageY=100,
            pageWidth=200,
            pageHeight=30,
            label="Name"
        )
    ]
    
    request = CreateDocumentRequest(
        title=title,
        recipients=[
            Recipient(
                name=recipient_name,
                email=recipient_email,
                role="SIGNER"
            )
        ],
        signatureFields=default_fields,
        sendEmail=False
    )
    
    return await create_document_for_signing(request, file)


@app.get("/api/documents/{document_id}/status")
async def get_document_status(document_id: int):
    """Get document status"""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{DOCUMENSO_URL}/api/v1/documents/{document_id}",
            headers={"Authorization": f"Bearer {DOCUMENSO_API_TOKEN}"}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return response.json()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
