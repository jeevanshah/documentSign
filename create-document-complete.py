import requests
import sys
import os

API_TOKEN = 'api_zp6muo4z1s7dalie'
API_BASE = 'http://localhost:3000'

def create_document_with_pdf(pdf_path):
    print('Step 1: Creating document...')
    
    # Step 1: Create document and get upload URL
    response = requests.post(
        f'{API_BASE}/api/v1/documents',
        headers={
            'Authorization': f'Bearer {API_TOKEN}',
            'Content-Type': 'application/json'
        },
        json={
            'title': 'Contract for Signing',
            'recipients': [
                {
                    'name': 'John Doe',
                    'email': 'john@example.com',
                    'role': 'SIGNER'
                }
            ]
        }
    )
    
    if not response.ok:
        raise Exception(f'Failed to create document: {response.text}')
    
    create_data = response.json()
    print(f"Document created: ID={create_data['documentId']}")
    print(f"Upload URL: {create_data['uploadUrl'][:50]}...")
    
    # Step 2: Upload PDF to the presigned URL
    print('\nStep 2: Uploading PDF...')
    with open(pdf_path, 'rb') as pdf_file:
        upload_response = requests.put(
            create_data['uploadUrl'],
            headers={'Content-Type': 'application/pdf'},
            data=pdf_file
        )
    
    if not upload_response.ok:
        raise Exception(f'Failed to upload PDF: {upload_response.text}')
    
    print('PDF uploaded successfully!')
    
    # Step 3: Add signature fields
    print('\nStep 3: Adding signature fields...')
    recipient_id = create_data['recipients'][0]['recipientId']
    
    fields_response = requests.post(
        f"{API_BASE}/api/v1/documents/{create_data['documentId']}/fields",
        headers={
            'Authorization': f'Bearer {API_TOKEN}',
            'Content-Type': 'application/json'
        },
        json=[
            {
                'recipientId': recipient_id,
                'type': 'SIGNATURE',
                'pageNumber': 1,
                'pageX': 100,
                'pageY': 500,
                'pageWidth': 200,
                'pageHeight': 60,
                'fieldMeta': {
                    'type': 'signature',
                    'label': 'Signature',
                    'required': True
                }
            },
            {
                'recipientId': recipient_id,
                'type': 'DATE',
                'pageNumber': 1,
                'pageX': 100,
                'pageY': 400,
                'pageWidth': 150,
                'pageHeight': 30,
                'fieldMeta': {
                    'type': 'date',
                    'label': 'Date',
                    'required': True
                }
            }
        ]
    )
    
    if not fields_response.ok:
        raise Exception(f'Failed to add fields: {fields_response.text}')
    
    fields_data = fields_response.json()
    print(f"Added {len(fields_data['fields'])} signature fields")
    
    # Step 4: Send the document
    print('\nStep 4: Sending document for signature...')
    send_response = requests.post(
        f"{API_BASE}/api/v1/documents/{create_data['documentId']}/send",
        headers={
            'Authorization': f'Bearer {API_TOKEN}',
            'Content-Type': 'application/json'
        },
        json={
            'sendEmail': False  # Set to True to send emails
        }
    )
    
    if not send_response.ok:
        raise Exception(f'Failed to send document: {send_response.text}')
    
    send_data = send_response.json()
    print('\nDocument ready for signing!')
    print('Signing URLs:')
    for recipient in send_data['recipients']:
        print(f"  {recipient['name']}: {recipient['signingUrl']}")
    
    return {
        'documentId': create_data['documentId'],
        'recipients': send_data['recipients']
    }

if __name__ == '__main__':
    pdf_path = sys.argv[1] if len(sys.argv) > 1 else './sample.pdf'
    
    if not os.path.exists(pdf_path):
        print(f'Error: PDF file not found at {pdf_path}')
        print('Usage: python create-document-complete.py <path-to-pdf>')
        sys.exit(1)
    
    try:
        result = create_document_with_pdf(pdf_path)
        print(f"\n✓ Complete! Document ID: {result['documentId']}")
    except Exception as e:
        print(f'\n✗ Error: {str(e)}')
        sys.exit(1)
