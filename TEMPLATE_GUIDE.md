# OpenSign Template Creation Guide

## Getting Started

### 1. Get Your API Token
1. Go to http://localhost:3000
2. Sign up / Log in
3. Navigate to Settings → API Token
4. Copy your API token

### 2. Prepare Your PDF
- Place your PDF file in the same directory as the script
- Update the `PDF_PATH` variable in the script

### 3. Understanding Coordinates

The coordinate system works as follows:
- **x**: Horizontal position from left edge (in pixels)
- **y**: Vertical position from top edge (in pixels)
- **w**: Width of the widget (in pixels)
- **h**: Height of the widget (in pixels)
- **page**: Page number (starts from 1)

**Tip**: Use the Debug UI at http://localhost:3000 to:
1. Upload your PDF
2. Add widgets visually
3. Copy the exact coordinates and JSON

## Multiple Signature Fields Example

Here's how to add signature fields in different locations:

```javascript
{
  "signers": [
    {
      "role": "Client",
      "widgets": [
        // Top of page 1
        {
          "type": "signature",
          "page": 1,
          "x": 100,
          "y": 100,
          "w": 150,
          "h": 50
        },
        // Bottom of page 1
        {
          "type": "signature",
          "page": 1,
          "x": 100,
          "y": 700,
          "w": 150,
          "h": 50
        },
        // Top of page 2
        {
          "type": "signature",
          "page": 2,
          "x": 100,
          "y": 100,
          "w": 150,
          "h": 50
        }
      ]
    }
  ]
}
```

## Common Widget Types

### Signature
```json
{
  "type": "signature",
  "page": 1,
  "x": 100,
  "y": 100,
  "w": 150,
  "h": 50
}
```

### Initials
```json
{
  "type": "initials",
  "page": 1,
  "x": 100,
  "y": 200,
  "w": 80,
  "h": 40,
  "options": {
    "required": true,
    "name": "initials"
  }
}
```

### Date
```json
{
  "type": "date",
  "page": 1,
  "x": 100,
  "y": 300,
  "w": 120,
  "h": 30,
  "options": {
    "required": true,
    "name": "signing_date",
    "format": "mm-dd-yyyy",
    "color": "black",
    "fontsize": 12
  }
}
```

### Name
```json
{
  "type": "name",
  "page": 1,
  "x": 100,
  "y": 400,
  "w": 150,
  "h": 30,
  "options": {
    "required": true,
    "name": "signer_name",
    "color": "black",
    "fontsize": 12
  }
}
```

### Email
```json
{
  "type": "email",
  "page": 1,
  "x": 100,
  "y": 500,
  "w": 200,
  "h": 30,
  "options": {
    "required": true,
    "name": "signer_email",
    "color": "black",
    "fontsize": 12
  }
}
```

### Textbox
```json
{
  "type": "textbox",
  "page": 1,
  "x": 100,
  "y": 600,
  "w": 200,
  "h": 30,
  "options": {
    "name": "custom_field",
    "required": true,
    "default": "",
    "hint": "Enter text here",
    "color": "black",
    "fontsize": 12
  }
}
```

### Checkbox
```json
{
  "type": "checkbox",
  "page": 1,
  "x": 100,
  "y": 650,
  "w": 150,
  "h": 60,
  "options": {
    "required": true,
    "name": "agreement",
    "values": ["I agree to terms", "I accept conditions"],
    "color": "black",
    "fontsize": 12,
    "validation": {
      "minselections": 1,
      "maxselections": 2
    }
  }
}
```

## Usage Instructions

### JavaScript (Node.js)
```bash
npm install axios
node create-template-example.js
```

### Python
```bash
pip install requests
python create-template-example.py
```

## Tips for Positioning Signature Fields

1. **Use the Debug UI**: The easiest way is to:
   - Go to http://localhost:3000
   - Upload your PDF
   - Add widgets visually
   - Copy the generated JSON

2. **Standard PDF sizes**:
   - Letter (8.5" × 11"): ~612 × 792 points
   - A4 (210mm × 297mm): ~595 × 842 points

3. **Common locations for signatures**:
   - Bottom left: `x: 50, y: 750`
   - Bottom right: `x: 400, y: 750`
   - Top right: `x: 400, y: 50`

4. **Initials on multiple pages**:
   ```javascript
   // Page 1 initials
   { "type": "initials", "page": 1, "x": 500, "y": 750, "w": 60, "h": 30 },
   // Page 2 initials
   { "type": "initials", "page": 2, "x": 500, "y": 750, "w": 60, "h": 30 },
   // Page 3 initials
   { "type": "initials", "page": 3, "x": 500, "y": 750, "w": 60, "h": 30 }
   ```

## Multiple Signers Example

```javascript
{
  "signers": [
    {
      "role": "Client",
      "email": "",
      "widgets": [
        // Client signature fields
        { "type": "signature", "page": 1, "x": 100, "y": 700, "w": 150, "h": 50 },
        { "type": "name", "page": 1, "x": 100, "y": 760, "w": 150, "h": 30 }
      ]
    },
    {
      "role": "Witness",
      "email": "",
      "widgets": [
        // Witness signature fields
        { "type": "signature", "page": 1, "x": 350, "y": 700, "w": 150, "h": 50 },
        { "type": "name", "page": 1, "x": 350, "y": 760, "w": 150, "h": 30 }
      ]
    }
  ]
}
```

## Troubleshooting

1. **PDF not loading**: Ensure the PDF is properly base64 encoded
2. **Widgets not visible**: Check x, y coordinates are within page bounds
3. **API errors**: Verify API token and endpoint URL
4. **Signature fields overlap**: Adjust x, y, w, h values to prevent overlap

## Next Steps

After creating a template, you can:
1. Use the template ID to send documents for signing
2. Customize the template in the OpenSign UI
3. Create multiple versions of the same template
