import requests
import json

# Your FastAPI backend URL
BACKEND_URL = "http://localhost:8000"

def test_quick_sign():
    """Simple test - upload PDF with default signature fields"""
    
    # Prepare the PDF file
    pdf_path = "sample.pdf"  # Replace with your PDF path
    
    with open(pdf_path, "rb") as f:
        files = {"file": ("document.pdf", f, "application/pdf")}
        
        params = {
            "title": "Employment Contract",
            "recipient_name": "John Doe",
            "recipient_email": "john@example.com"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/api/documents/quick-sign",
            params=params,
            files=files
        )
    
    if response.status_code == 200:
        data = response.json()
        print("✅ Success!")
        print(f"Document ID: {data['documentId']}")
        print("\nSigning URLs:")
        for url_info in data['signingUrls']:
            print(f"  {url_info['recipientName']}: {url_info['signingUrl']}")
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)


def test_custom_fields():
    """Advanced test - custom signature field positions"""
    
    pdf_path = "sample.pdf"  # Replace with your PDF path
    
    # Custom request with specific field positions
    request_data = {
        "title": "Custom Contract",
        "recipients": [
            {
                "name": "Alice Smith",
                "email": "alice@example.com",
                "role": "SIGNER"
            }
        ],
        "subject": "Please review and sign",
        "message": "Your signature is required",
        "signatureFields": [
            {
                "type": "SIGNATURE",
                "pageNumber": 1,
                "pageX": 150,
                "pageY": 300,
                "pageWidth": 250,
                "pageHeight": 80,
                "label": "Signature",
                "required": True
            },
            {
                "type": "DATE",
                "pageNumber": 1,
                "pageX": 150,
                "pageY": 250,
                "pageWidth": 150,
                "pageHeight": 30,
                "label": "Date Signed",
                "required": True
            },
            {
                "type": "NAME",
                "pageNumber": 1,
                "pageX": 150,
                "pageY": 200,
                "pageWidth": 200,
                "pageHeight": 30,
                "label": "Full Name",
                "required": True
            },
            {
                "type": "EMAIL",
                "pageNumber": 1,
                "pageX": 150,
                "pageY": 150,
                "pageWidth": 250,
                "pageHeight": 30,
                "label": "Email Address",
                "required": False
            }
        ],
        "sendEmail": False
    }
    
    with open(pdf_path, "rb") as f:
        files = {"file": ("document.pdf", f, "application/pdf")}
        data = {"request": json.dumps(request_data)}
        
        response = requests.post(
            f"{BACKEND_URL}/api/documents/create-and-sign",
            data=data,
            files=files
        )
    
    if response.status_code == 200:
        result = response.json()
        print("✅ Success with custom fields!")
        print(f"Document ID: {result['documentId']}")
        print("\nSigning URLs:")
        for url_info in result['signingUrls']:
            print(f"  {url_info['recipientName']}: {url_info['signingUrl']}")
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)


def check_document_status(document_id):
    """Check document signing status"""
    response = requests.get(f"{BACKEND_URL}/api/documents/{document_id}/status")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Document Status: {data['status']}")
        print(f"Title: {data['title']}")
        print(f"Created: {data['createdAt']}")
    else:
        print(f"Error: {response.status_code}")


if __name__ == "__main__":
    print("Testing FastAPI Documenso Integration\n")
    print("=" * 50)
    
    # Test 1: Quick sign with default fields
    print("\n1. Testing quick sign...")
    test_quick_sign()
    
    # Test 2: Custom fields
    # print("\n2. Testing custom fields...")
    # test_custom_fields()
    
    # Test 3: Check status
    # print("\n3. Checking document status...")
    # check_document_status(1)
