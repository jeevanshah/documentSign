const API_TOKEN = 'api_zp6muo4z1s7dalie';
const API_BASE = 'http://localhost:3000';

async function testTemplateWorkflow() {
  try {
    console.log('Testing Template-based workflow...\n');
    
    // Step 1: Create a template
    console.log('Step 1: Creating template...');
    const templateResponse = await fetch(`${API_BASE}/api/v1/templates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Contract Template'
      })
    });

    if (!templateResponse.ok) {
      const errorText = await templateResponse.text();
      console.error('❌ Template creation failed:', errorText);
      return;
    }

    const templateData = await templateResponse.json();
    console.log('✓ Template created!');
    console.log(`  Template ID: ${templateData.template.id}`);
    console.log(`  Upload URL: ${templateData.uploadUrl.substring(0, 60)}...`);
    
    console.log('\n✓ Template API works!');
    console.log('\nWorkflow:');
    console.log('1. Upload PDF to the uploadUrl');
    console.log('2. Add recipients and fields to template');
    console.log('3. Generate documents from template');
    
    return templateData;
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testTemplateWorkflow();
