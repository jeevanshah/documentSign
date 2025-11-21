import requests
import base64
import json

# Configuration
API_URL = 'http://localhost:8080/api/v1/createtemplate'
API_TOKEN = 'YOUR_API_TOKEN_HERE'  # Get this from OpenSign dashboard
PDF_PATH = './your-document.pdf'  # Path to your PDF file

def pdf_to_base64(file_path):
    """Read PDF and convert to base64"""
    with open(file_path, 'rb') as pdf_file:
        return base64.b64encode(pdf_file.read()).decode('utf-8')

def create_template():
    """Create template with multiple signature fields"""
    try:
        # Read and encode PDF
        base64_pdf = pdf_to_base64(PDF_PATH)
        
        # Template data with multiple signature fields
        template_data = {
            "file": base64_pdf,
            "title": "Sample Contract Template",
            "note": "Please sign in all designated areas",
            "description": "Contract with multiple signature fields",
            "signers": [
                {
                    "role": "Client",
                    "email": "",  # Leave empty for template
                    "name": "",
                    "phone": "",
                    "widgets": [
                        # First signature field (page 1, top)
                        {
                            "type": "signature",
                            "page": 1,
                            "x": 100,
                            "y": 100,
                            "w": 150,
                            "h": 50
                        },
                        # Second signature field (page 1, middle)
                        {
                            "type": "signature",
                            "page": 1,
                            "x": 100,
                            "y": 400,
                            "w": 150,
                            "h": 50
                        },
                        # Date field
                        {
                            "type": "date",
                            "page": 1,
                            "x": 270,
                            "y": 400,
                            "w": 100,
                            "h": 50,
                            "options": {
                                "required": True,
                                "name": "signing_date",
                                "format": "mm-dd-yyyy",
                                "color": "black",
                                "fontsize": 12
                            }
                        },
                        # Initials field
                        {
                            "type": "initials",
                            "page": 1,
                            "x": 100,
                            "y": 700,
                            "w": 80,
                            "h": 40,
                            "options": {
                                "required": True,
                                "name": "initials_1"
                            }
                        },
                        # Name field
                        {
                            "type": "name",
                            "page": 1,
                            "x": 100,
                            "y": 160,
                            "w": 150,
                            "h": 30,
                            "options": {
                                "required": True,
                                "name": "client_name",
                                "color": "black",
                                "fontsize": 12
                            }
                        },
                        # Email field
                        {
                            "type": "email",
                            "page": 1,
                            "x": 100,
                            "y": 200,
                            "w": 200,
                            "h": 30,
                            "options": {
                                "required": True,
                                "name": "client_email",
                                "color": "black",
                                "fontsize": 12
                            }
                        }
                    ]
                },
                {
                    "role": "Company Representative",
                    "email": "",
                    "name": "",
                    "phone": "",
                    "widgets": [
                        # Company signature
                        {
                            "type": "signature",
                            "page": 1,
                            "x": 400,
                            "y": 100,
                            "w": 150,
                            "h": 50
                        },
                        # Company name
                        {
                            "type": "name",
                            "page": 1,
                            "x": 400,
                            "y": 160,
                            "w": 150,
                            "h": 30,
                            "options": {
                                "required": True,
                                "name": "company_rep_name",
                                "color": "black",
                                "fontsize": 12
                            }
                        },
                        # Company stamp (optional)
                        {
                            "type": "stamp",
                            "page": 1,
                            "x": 400,
                            "y": 400,
                            "w": 120,
                            "h": 120,
                            "options": {
                                "required": False,
                                "name": "company_stamp"
                            }
                        }
                    ]
                }
            ],
            "sendInOrder": True,
            "enableOTP": False,
            "enableTour": True,
            "redirect_url": "",
            "sender_name": "Your Company",
            "sender_email": "mailer@yourcompany.com",
            "allow_modifications": False,
            "auto_reminder": True,
            "remind_once_in_every": 3
        }
        
        # Make API request
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'x-api-token': API_TOKEN
        }
        
        response = requests.post(API_URL, json=template_data, headers=headers)
        response.raise_for_status()
        
        result = response.json()
        print('Template created successfully!')
        print(f'Template ID: {result.get("objectId")}')
        print(f'Full response: {json.dumps(result, indent=2)}')
        
        return result
        
    except requests.exceptions.RequestException as e:
        print(f'Error creating template: {e}')
        if hasattr(e.response, 'text'):
            print(f'Response: {e.response.text}')
        raise

if __name__ == '__main__':
    create_template()
