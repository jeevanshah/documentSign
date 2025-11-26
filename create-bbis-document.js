const fs = require('fs');

const API_URL = 'http://localhost:3000';
const API_TOKEN = 'api_jv5z81lxghwwuiaf';
const PDF_PATH = 'C:\\Users\\j.shah\\Downloads\\BBIS_David_THAPA.pdf';

async function createDocumentWithInitialsAndDate() {
  try {
    console.log('🚀 Creating document with initials and date on each page...\n');

    // Step 1: Create document
    console.log('Step 1: Creating document...');
    const createResponse = await fetch(`${API_URL}/api/v1/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'BBIS David THAPA - Student Agreement',
        recipients: [
          {
            name: 'David THAPA',
            email: 'oldnime@gmail.com',
            role: 'SIGNER'
          }
        ],
        meta: {
          subject: 'Please sign the student agreement',
          message: 'Please initial each page and sign the document'
        }
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Create failed: ${createResponse.status} - ${errorText}`);
    }

    const createData = await createResponse.json();
    console.log('Create response:', JSON.stringify(createData, null, 2));
    const { uploadUrl, documentId, recipients } = createData;
    const recipientId = recipients[0].recipientId;

    console.log(`✓ Document created with ID: ${documentId}\n`);

    // Step 2: Upload PDF
    console.log('Step 2: Uploading PDF...');
    const pdfBuffer = fs.readFileSync(PDF_PATH);
    
    // Copy PDF to Docker container
    const { execSync } = require('child_process');
    const tempPath = `/tmp/upload_${documentId}.pdf`;
    
    console.log('  Copying PDF to Docker container...');
    execSync(`docker cp "${PDF_PATH}" documenso-app:${tempPath}`);
    
    console.log('  Uploading from within container...');
    const uploadScript = `
const fs = require('fs');
const buffer = fs.readFileSync('${tempPath}');
fetch('${uploadUrl}', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/pdf', 'Content-Length': buffer.length.toString() },
  body: buffer
}).then(r => r.ok ? process.exit(0) : process.exit(1));
`;
    
    execSync(`docker exec documenso-app node -e "${uploadScript.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`);
    
    console.log('✓ PDF uploaded!\n');

    // Recipient already added during document creation (Step 1)
    console.log(`Using recipient ID: ${recipientId}\n`);

    // Step 3: Add initials and date fields for all 8 pages
    console.log('Step 3: Adding initials and date fields for 8 pages...');
    
    const fields = [];
    
    // For each of the 8 pages - use correct coordinates from send-bbis-document.js
    for (let page = 1; page <= 8; page++) {
      // Initials field
      fields.push({
        recipientId: recipientId,
        type: 'INITIALS',
        pageNumber: page,
        pageX: 72,
        pageY: 92,
        pageWidth: 4,
        pageHeight: 2,
        fieldMeta: {
          type: 'initials',
          label: `Page ${page} Initials`,
          required: true,
          fontSize: 10
        }
      });

      // Date field
      fields.push({
        recipientId: recipientId,
        type: 'DATE',
        pageNumber: page,
        pageX: 81,
        pageY: 92,
        pageWidth: 5,
        pageHeight: 2,
        fieldMeta: {
          type: 'date',
          label: `Page ${page} Date`,
          required: true,
          fontSize: 10
        }
      });
    }

    // Add Page 5 signature fields for student
    fields.push(
      {
        type: 'NAME',
        recipientId: recipientId,
        pageNumber: 5,
        pageX: 63,
        pageY: 34.5,
        pageWidth: 30,
        pageHeight: 1.5,
        fieldMeta: {
          type: 'name',
          label: 'Student Name',
          placeholder: 'Enter your full name',
          required: true,
          fontSize: 12
        }
      },
      {
        type: 'SIGNATURE',
        recipientId: recipientId,
        pageNumber: 5,
        pageX: 72,
        pageY: 38.25,
        pageWidth: 25,
        pageHeight: 1.5,
        fieldMeta: {
          type: 'signature',
          label: 'Student Signature',
          required: true,
          fontSize: 14
        }
      },
      {
        type: 'DATE',
        recipientId: recipientId,
        pageNumber: 5,
        pageX: 56,
        pageY: 39,
        pageWidth: 15,
        pageHeight: 1.5,
        fieldMeta: {
          type: 'date',
          label: 'Student Signature Date',
          required: true,
          fontSize: 11
        }
      }
    );

    const fieldsResponse = await fetch(`${API_URL}/api/v1/documents/${documentId}/fields`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fields)
    });

    if (!fieldsResponse.ok) {
      throw new Error(`Add fields failed: ${await fieldsResponse.text()}`);
    }

    console.log(`✓ Added ${fields.length} fields!\n`);

    // Step 4: Send document
    console.log('Step 4: Sending document...');
    const sendResponse = await fetch(`${API_URL}/api/v1/documents/${documentId}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sendEmail: true
      })
    });

    if (!sendResponse.ok) {
      throw new Error(`Send failed: ${await sendResponse.text()}`);
    }

    console.log('✓ Document sent!\n');

    // Display results
    console.log('═══════════════════════════════════════');
    console.log('✅ SUCCESS! Document created and sent');
    console.log('═══════════════════════════════════════\n');
    console.log(`Document ID: ${documentId}`);
    console.log(`Document Name: BBIS David THAPA - Student Agreement`);
    console.log(`Recipient: David THAPA (oldnime@gmail.com)`);
    console.log(`\nFields added per page:`);
    console.log('  • Initials (bottom left) - 50px from bottom');
    console.log('  • Date (bottom right) - 50px from bottom');
    console.log(`\nTotal pages: 8`);
    console.log(`Total fields: ${fields.length}`);
    console.log('\nYou can view this document in Documenso:');
    console.log(`http://localhost:3000/documents/${documentId}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

createDocumentWithInitialsAndDate();
