const API_URL = 'http://localhost:3000';
const API_TOKEN = 'api_jv5z81lxghwwuiaf';

async function testEmailSending() {
  console.log('Testing email sending via Outlook SMTP...\n');

  try {
    console.log('Step 1: Creating document...');
    const createResponse = await fetch(`${API_URL}/api/v1/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Email Test Document',
        recipients: [
          {
            name: 'Test Recipient',
            email: 'j.shah@churchill.nsw.edu.au', // Change to your email
            role: 'SIGNER'
          }
        ],
        meta: {
          subject: 'Test: Please sign this document',
          message: 'This is a test email from Documenso'
        }
      })
    });

    if (!createResponse.ok) {
      throw new Error(`Create failed: ${await createResponse.text()}`);
    }

    const createData = await createResponse.json();
    const documentId = createData.id;
    const recipientId = createData.recipients[0].id;

    console.log(`✓ Document created (ID: ${documentId})`);
    console.log(`✓ Recipient ID: ${recipientId}\n`);

    // For email testing, we need to add at least one field before sending
    console.log('Step 2: Adding a signature field...');
    const fieldsResponse = await fetch(`${API_URL}/api/v1/documents/${documentId}/fields`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{
        recipientId: recipientId,
        type: 'SIGNATURE',
        pageNumber: 1,
        pageX: 100,
        pageY: 200,
        pageWidth: 200,
        pageHeight: 60
      }])
    });

    if (!fieldsResponse.ok) {
      console.log('⚠️  Warning: Could not add field, continuing anyway...');
    } else {
      console.log('✓ Signature field added\n');
    }

    console.log('Step 3: Sending document with email notification...');
    const sendResponse = await fetch(`${API_URL}/api/v1/documents/${documentId}/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sendEmail: true  // Enable email sending
      })
    });

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      throw new Error(`Send failed: ${errorText}`);
    }

    console.log('✓ Document sent!\n');
    console.log('═══════════════════════════════════════');
    console.log('✅ Email should be sent!');
    console.log('═══════════════════════════════════════');
    console.log('\nCheck your inbox: j.shah@churchill.nsw.edu.au');
    console.log('Subject: "Test: Please sign this document"');
    console.log('From: docsign@churchill.nsw.edu.au');
    console.log('\n💡 If email not received, check:');
    console.log('   1. Spam/Junk folder');
    console.log('   2. Docker logs: docker logs documenso-app -f');
    console.log('   3. SMTP authentication might be blocked by IT');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nIf you see SMTP authentication error:');
    console.log('- Your IT department may have disabled SMTP for security');
    console.log('- Consider using SendGrid instead (free, no IT approval needed)');
  }
}

testEmailSending();
