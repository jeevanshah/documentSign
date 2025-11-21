const fs = require('fs');
const fetch = require('node-fetch');

const API_TOKEN = 'api_zp6muo4z1s7dalie';
const API_BASE = 'http://localhost:3000';

async function createDocumentWithPDF(pdfPath) {
  console.log('Step 1: Creating document...');
  
  // Step 1: Create document and get upload URL
  const createResponse = await fetch(`${API_BASE}/api/v1/documents`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'Contract for Signing',
      recipients: [
        {
          name: 'John Doe',
          email: 'john@example.com',
          role: 'SIGNER'
        }
      ]
    })
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new Error(`Failed to create document: ${error}`);
  }

  const createData = await createResponse.json();
  console.log('Document created:', {
    documentId: createData.documentId,
    uploadUrl: createData.uploadUrl.substring(0, 50) + '...'
  });

  // Step 2: Upload PDF to the presigned URL
  console.log('\nStep 2: Uploading PDF...');
  const pdfBuffer = fs.readFileSync(pdfPath);
  
  const uploadResponse = await fetch(createData.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/pdf'
    },
    body: pdfBuffer
  });

  if (!uploadResponse.ok) {
    throw new Error(`Failed to upload PDF: ${uploadResponse.statusText}`);
  }

  console.log('PDF uploaded successfully!');

  // Step 3: Add signature fields
  console.log('\nStep 3: Adding signature fields...');
  
  const recipientId = createData.recipients[0].recipientId;
  
  const fieldsResponse = await fetch(`${API_BASE}/api/v1/documents/${createData.documentId}/fields`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([
      {
        recipientId: recipientId,
        type: 'SIGNATURE',
        pageNumber: 1,
        pageX: 100,
        pageY: 500,
        pageWidth: 200,
        pageHeight: 60,
        fieldMeta: {
          type: 'signature',
          label: 'Signature',
          required: true
        }
      },
      {
        recipientId: recipientId,
        type: 'DATE',
        pageNumber: 1,
        pageX: 100,
        pageY: 400,
        pageWidth: 150,
        pageHeight: 30,
        fieldMeta: {
          type: 'date',
          label: 'Date',
          required: true
        }
      }
    ])
  });

  if (!fieldsResponse.ok) {
    const error = await fieldsResponse.text();
    throw new Error(`Failed to add fields: ${error}`);
  }

  const fieldsData = await fieldsResponse.json();
  console.log(`Added ${fieldsData.fields.length} signature fields`);

  // Step 4: Send the document
  console.log('\nStep 4: Sending document for signature...');
  
  const sendResponse = await fetch(`${API_BASE}/api/v1/documents/${createData.documentId}/send`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sendEmail: false  // Set to true to send emails
    })
  });

  if (!sendResponse.ok) {
    const error = await sendResponse.text();
    throw new Error(`Failed to send document: ${error}`);
  }

  const sendData = await sendResponse.json();
  console.log('\nDocument ready for signing!');
  console.log('Signing URLs:');
  sendData.recipients.forEach(recipient => {
    console.log(`  ${recipient.name}: ${recipient.signingUrl}`);
  });

  return {
    documentId: createData.documentId,
    recipients: sendData.recipients
  };
}

// Usage
const pdfPath = process.argv[2] || './sample.pdf';

if (!fs.existsSync(pdfPath)) {
  console.error(`Error: PDF file not found at ${pdfPath}`);
  console.log('Usage: node create-document-complete.js <path-to-pdf>');
  process.exit(1);
}

createDocumentWithPDF(pdfPath)
  .then(result => {
    console.log('\n✓ Complete! Document ID:', result.documentId);
  })
  .catch(error => {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  });
