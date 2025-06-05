# Translation Contribution Guide

## Overview

This guide explains how to properly add translations for new UI elements in the JobTicketInvoice application. Following these guidelines ensures a consistent internationalization experience across the application.

## Adding New Translation Keys

1. **Location**: All translation keys are centralized in `src/translations.js`

2. **Structure**: Translations are organized by functional areas:
   - `auth`: Authentication-related text
   - `common`: Reusable UI elements and actions
   - `jobTicket`: Job ticket specific text
   - `errors`: Error messages
   - `workTypes`: Work type options

3. **Naming Convention**: Use camelCase for keys and organize hierarchically:
   ```javascript
   // Example structure
   componentName: {
     featureName: 'Translation text',
     subFeature: {
       element: 'Translation text'
     }
   }
   ```

## Step-by-Step Process

1. **Identify Text Needs**: Before implementing a new feature, identify all user-facing text elements

2. **Add Keys to Translation File**:
   - Add keys to both English (`en`) and Spanish (`es`) sections
   - Keep keys identical in both language objects
   - Group related keys together

3. **Use in Components**:
   ```javascript
   import { useLanguage } from '../context/LanguageContext';
   
   const MyComponent = () => {
     const { t } = useLanguage();
     
     return (
       <div>
         <h1>{t('componentName.title')}</h1>
         <p>{t('componentName.description')}</p>
       </div>
     );
   };
   ```

4. **Handle Dynamic Content**:
   - For text with variables, use template literals:
     ```javascript
     // In component
     const message = t('common.welcomeUser').replace('{{name}}', userName);
     
     // In translations.js
     welcomeUser: 'Welcome, {{name}}!'
     ```

5. **Testing**:
   - Always test your new translations by switching between languages
   - Verify text displays properly in all supported languages
   - Check for text overflow or layout issues

## Best Practices

- **Never Hardcode Text**: Always use translation keys, even for seemingly "fixed" text
- **Reuse Common Keys**: Use existing keys in `common` for actions like "Save", "Cancel", "Delete"
- **Keep Translations Concise**: Spanish text is often 20-30% longer than English
- **Document Context**: Add comments for translation keys that might be ambiguous
- **Maintain Alphabetical Order**: Keep keys alphabetically sorted within their sections

## Example

```javascript
// Adding a new feature "report generator"
// In translations.js

// English
reports: {
  generate: 'Generate Report',
  dateRange: 'Date Range',
  exportAs: 'Export as',
  formats: {
    pdf: 'PDF Document',
    csv: 'CSV Spreadsheet'
  },
  success: 'Report generated successfully'
},

// Spanish
reports: {
  generate: 'Generar Informe',
  dateRange: 'Rango de Fechas',
  exportAs: 'Exportar como',
  formats: {
    pdf: 'Documento PDF',
    csv: 'Hoja de cálculo CSV'
  },
  success: 'Informe generado con éxito'
},
```

By following this guide, you'll help maintain a consistent, multilingual user experience throughout the application.
