const API_TOKEN = 'api_jv5z81lxghwwuiaf';
const API_BASE = 'http://localhost:3000';

async function testDocumentCreation() {
  try {
    console.log('Testing Documenso API workflow...\n');
    
    // Step 1: Create document
    console.log('Step 1: Creating document...');
    const createResponse = await fetch(`${API_BASE}/api/v1/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'API Test Document',
        recipients: [
          {
            name: 'Test User',
            email: 'test@example.com',
            role: 'SIGNER'
          }
        ]
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('❌ Create failed:', errorText);
      return;
    }

    const createData = await createResponse.json();
    console.log('✓ Document created successfully!');
    console.log(`  Document ID: ${createData.documentId}`);
    console.log(`  Recipient ID: ${createData.recipients[0].recipientId}`);
    console.log(`  Upload URL: ${createData.uploadUrl.substring(0, 60)}...`);
    
    console.log('\n✓ API is working correctly!');
    console.log('\nNext steps:');
    console.log('1. Upload a PDF to the uploadUrl using PUT request');
    console.log('2. Add signature fields using POST /documents/{id}/fields');
    console.log('3. Send the document using POST /documents/{id}/send');
    console.log('\nSee CORRECT_WORKFLOW.md for full details.');
    
    return createData;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDocumentCreation();
