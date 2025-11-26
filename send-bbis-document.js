const fs = require('fs');

const API_URL = 'http://localhost:3000';
const API_TOKEN = 'api_jv5z81lxghwwuiaf';
const PDF_PATH = 'C:\\Users\\j.shah\\Downloads\\BBIS_David_THAPA.pdf';

async function createDocumentWithFields() {
  try {
    console.log('🚀 Creating document with initials and date on each page...\n');

    // Prepare fields for all 8 pages
    const fields = [];
    for (let page = 1; page <= 8; page++) {
      fields.push({
        type: 'INITIALS',
        pageNumber: page,
        pageX: 72,
        pageY: 92,
        pageWidth: 3,
        pageHeight: 1.5,
        required: true,
        fieldMeta: {
          type: 'initials',
          label: `Page ${page} Initials`,
          required: true,
          fontSize: 10
        }
      });

      fields.push({
        type: 'DATE',
        pageNumber: page,
        pageX: 81,
        pageY: 92,
        pageWidth: 4,
        pageHeight: 1.5,
        required: true,
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
        pageNumber: 5,
        pageX: 63,
        pageY: 34,
        pageWidth: 30,
        pageHeight: 2.5,
        required: true,
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
        pageNumber: 5,
        pageX: 72,
        pageY: 38,
        pageWidth: 25,
        pageHeight: 3,
        required: true,
        fieldMeta: {
          type: 'signature',
          label: 'Student Signature',
          required: true,
          fontSize: 14
        }
      },
      {
        type: 'DATE',
        pageNumber: 5,
        pageX: 56,
        pageY: 39,
        pageWidth: 15,
        pageHeight: 1.5,
        required: true,
        fieldMeta: {
          type: 'date',
          label: 'Student Signature Date',
          required: true,
          fontSize: 11
        }
      }
    );

    // Step 1: Create document with recipient and witness
    console.log('Step 1: Creating document with recipients...');
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
          },
          {
            name: 'J Shah',
            email: 'j.shah@churchill.nsw.edu.au',
            role: 'SIGNER'
          }
        ],
        meta: {
          subject: 'Please sign the student agreement',
          message: 'Please initial each page and sign the document',
          timezone: 'Australia/Sydney',
          dateFormat: 'dd/MM/yyyy'
        }
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Create failed: ${createResponse.status} - ${errorText}`);
    }

    const createData = await createResponse.json();
    console.log('DEBUG - Create Response:', JSON.stringify(createData, null, 2));
    
    const { uploadUrl, documentId, recipients } = createData;
    const studentRecipient = recipients.find(r => r.email === 'oldnime@gmail.com');
    const witnessRecipient = recipients.find(r => r.email === 'j.shah@churchill.nsw.edu.au');
    const studentRecipientId = studentRecipient?.recipientId || studentRecipient?.id;
    const witnessRecipientId = witnessRecipient?.recipientId || witnessRecipient?.id;

    console.log(`✓ Document created with ID: ${documentId}`);
    console.log(`✓ Student Recipient ID: ${studentRecipientId}`);
    console.log(`✓ Witness Recipient ID: ${witnessRecipientId}\n`);

    // Step 2: Upload PDF file
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

    // Step 3: Add fields (V1 API doesn't support fields in create)
    console.log('Step 3: Adding fields to document...');
    
    // Add witness fields on page 5
    fields.push(
      {
        type: 'NAME',
        pageNumber: 5,
        pageX: 63,
        pageY: 48,
        pageWidth: 30,
        pageHeight: 2.5,
        required: true,
        recipientId: witnessRecipientId,
        fieldMeta: {
          type: 'name',
          label: 'Witness Name',
          placeholder: 'Enter witness full name',
          required: true,
          fontSize: 12
        }
      },
      {
        type: 'SIGNATURE',
        pageNumber: 5,
        pageX: 67,
        pageY: 51,
        pageWidth: 30,
        pageHeight: 3,
        required: true,
        recipientId: witnessRecipientId,
        fieldMeta: {
          type: 'signature',
          label: 'Witness Signature',
          required: true,
          fontSize: 14
        }
      },
      {
        type: 'DATE',
        pageNumber: 5,
        pageX: 56,
        pageY: 53,
        pageWidth: 15,
        pageHeight: 1.5,
        required: true,
        recipientId: witnessRecipientId,
        fieldMeta: {
          type: 'date',
          label: 'Witness Signature Date',
          required: true,
          fontSize: 11
        }
      }
    );
    
    const fieldPayload = fields.map(f => ({
      ...f,
      recipientId: f.recipientId || studentRecipientId
    }));

    const fieldsResponse = await fetch(`${API_URL}/api/v1/documents/${documentId}/fields`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fieldPayload)
    });

    if (!fieldsResponse.ok) {
      const errorText = await fieldsResponse.text();
      throw new Error(`Add fields failed: ${fieldsResponse.status} - ${errorText}`);
    }

    console.log(`✓ Added ${fields.length} fields!\n`);

    // Step 4: Send document
    console.log('Step 3: Sending document...');
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
    console.log(`\nStudent: David THAPA (oldnime@gmail.com)`);
    console.log(`Signing URL: ${studentRecipient.signingUrl}`);
    console.log(`\nWitness: J Shah (j.shah@churchill.nsw.edu.au)`);
    console.log(`Signing URL: ${witnessRecipient.signingUrl}`);
    console.log(`\nFields: ${fields.length} total`);
    console.log(`  - ${fields.length - 6} initials/date fields (all 8 pages)`);
    console.log(`  - 3 student signature fields (page 5)`);
    console.log(`  - 3 witness signature fields (page 5)`);
    console.log(`\nView in Documenso: http://localhost:3000/documents/${documentId}`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

createDocumentWithFields();
