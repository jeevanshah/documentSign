const axios = require('axios');
const fs = require('fs');

// Configuration
const API_URL = 'http://localhost:8080/api/v1/createtemplate';
const API_TOKEN = 'YOUR_API_TOKEN_HERE'; // Get this from OpenSign dashboard
const PDF_PATH = './your-document.pdf'; // Path to your PDF file

// Read PDF and convert to base64
function pdfToBase64(filePath) {
  const pdf = fs.readFileSync(filePath);
  return pdf.toString('base64');
}

// Create template with multiple signature fields
async function createTemplate() {
  try {
    const base64Pdf = pdfToBase64(PDF_PATH);
    
    const templateData = {
      file: base64Pdf,
      title: "Sample Contract Template",
      note: "Please sign in all designated areas",
      description: "Contract with multiple signature fields",
      signers: [
        {
          role: "Client",
          email: "", // Leave empty for template
          name: "",
          phone: "",
          widgets: [
            // First signature field (top of page 1)
            {
              type: "signature",
              page: 1,
              x: 100,
              y: 100,
              w: 150,
              h: 50
            },
            // Second signature field (middle of page 1)
            {
              type: "signature",
              page: 1,
              x: 100,
              y: 400,
              w: 150,
              h: 50
            },
            // Date field next to second signature
            {
              type: "date",
              page: 1,
              x: 270,
              y: 400,
              w: 100,
              h: 50,
              options: {
                required: true,
                name: "signing_date",
                format: "mm-dd-yyyy",
                color: "black",
                fontsize: 12
              }
            },
            // Initials field (bottom of page 1)
            {
              type: "initials",
              page: 1,
              x: 100,
              y: 700,
              w: 80,
              h: 40,
              options: {
                required: true,
                name: "initials_1"
              }
            }
          ]
        },
        {
          role: "Company Representative",
          email: "",
          name: "",
          phone: "",
          widgets: [
            // Company signature field
            {
              type: "signature",
              page: 1,
              x: 400,
              y: 100,
              w: 150,
              h: 50
            },
            // Company name field
            {
              type: "name",
              page: 1,
              x: 400,
              y: 160,
              w: 150,
              h: 30,
              options: {
                required: true,
                name: "company_rep_name",
                color: "black",
                fontsize: 12
              }
            },
            // Company stamp
            {
              type: "stamp",
              page: 1,
              x: 400,
              y: 400,
              w: 120,
              h: 120,
              options: {
                required: false,
                name: "company_stamp"
              }
            }
          ]
        }
      ],
      sendInOrder: true,
      enableOTP: false,
      enableTour: true,
      redirect_url: "",
      sender_name: "Your Company",
      sender_email: "mailer@yourcompany.com",
      allow_modifications: false,
      auto_reminder: true,
      remind_once_in_every: 3
    };

    const response = await axios.post(API_URL, templateData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-token': API_TOKEN
      }
    });

    console.log('Template created successfully!');
    console.log('Template ID:', response.data.objectId);
    console.log('Full response:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Error creating template:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    throw error;
  }
}

// Run the function
createTemplate()
  .then(() => console.log('Done!'))
  .catch(() => process.exit(1));
