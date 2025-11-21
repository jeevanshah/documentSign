const fs = require('fs');

const API_URL = 'http://localhost:3000';
const API_TOKEN = 'api_jv5z81lxghwwuiaf';

async function completeWorkflow(pdfPath) {
  try {
    console.log('🚀 Starting document signing workflow...\n');

    // STEP 1: Create document
    console.log('Step 1: Creating document...');
    const createResponse = await fetch(`${API_URL}/api/v1/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Contract for Signing',
        recipients: [
          {
            name: 'John Doe',
            email: 'john@example.com',
            role: 'SIGNER'
          }
        ],
        meta: {
          subject: 'Please sign this document',
          message: 'Review and sign the attached document'
        }
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Create failed: ${await createResponse.text()}`);
    }

    const createData = await createResponse.json();
    const { uploadUrl, id: documentId, recipients } = createData;
    const recipientId = recipients[0].id;

    console.log(`✓ Document created!`);
    console.log(`  Document ID: ${documentId}`);
    console.log(`  Recipient ID: ${recipientId}\n`);

    // STEP 2: Upload PDF
    console.log('Step 2: Uploading PDF...');
    const pdfBuffer = fs.readFileSync(pdfPath);
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/pdf',
      },
      body: pdfBuffer
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.status}`);
    }

    console.log('✓ PDF uploaded!\n');

    // STEP 3: Add signature fields
    console.log('Step 3: Adding signature fields...');
    const fieldsResponse = await fetch(`${API_URL}/api/v1/documents/${documentId}/fields`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([
        {
          recipientId: recipientId,
          type: 'SIGNATURE',
          pageNumber: 1,
          pageX: 100,      // 100px from left
          pageY: 200,      // 200px from BOTTOM
          pageWidth: 200,  // 200px wide
          pageHeight: 60   // 60px tall
        },
        {
          recipientId: recipientId,
          type: 'DATE',
          pageNumber: 1,
          pageX: 100,
          pageY: 150,
          pageWidth: 150,
          pageHeight: 30
        },
        {
          recipientId: recipientId,
          type: 'NAME',
          pageNumber: 1,
          pageX: 100,
          pageY: 100,
          pageWidth: 200,
          pageHeight: 30
        }
      ])
    });

    if (!fieldsResponse.ok) {
      throw new Error(`Add fields failed: ${await fieldsResponse.text()}`);
    }

    const fieldsData = await fieldsResponse.json();
    console.log(`✓ Added ${fieldsData.fields.length} signature fields!\n`);

    // STEP 4: Send document
    console.log('Step 4: Sending document...');
    const sendResponse = await fetch(`${API_URL}/api/v1/documents/${documentId}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sendEmail: false  // Set to true to send email
      })
    });

    if (!sendResponse.ok) {
      throw new Error(`Send failed: ${await sendResponse.text()}`);
    }

    const sendData = await sendResponse.json();
    console.log('✓ Document sent!\n');

    // Display results
    console.log('═══════════════════════════════════════');
    console.log('✅ SUCCESS! Document ready for signing');
    console.log('═══════════════════════════════════════\n');
    console.log(`Document ID: ${documentId}`);
    console.log(`\nSigning URL for John Doe:`);
    console.log(`${recipients[0].signingUrl}\n`);
    console.log('Fields added:');
    console.log('  • Signature field at (100, 200)');
    console.log('  • Date field at (100, 150)');
    console.log('  • Name field at (100, 100)');
    console.log('\nOpen the signing URL in a browser to sign the document!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

// Usage
const pdfPath = process.argv[2];

if (!pdfPath) {
  console.log('Usage: node complete-example.js <path-to-pdf>');
  console.log('Example: node complete-example.js contract.pdf');
  process.exit(1);
}

if (!fs.existsSync(pdfPath)) {
  console.error(`Error: File not found: ${pdfPath}`);
  process.exit(1);
}

completeWorkflow(pdfPath);
