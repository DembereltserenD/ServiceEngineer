/**
 * Script to add ProtectedRoute to pages
 */

const fs = require('fs');
const path = require('path');

const pagesToProtect = [
  'src/app/tasks/page.tsx',
  'src/app/analytics/page.tsx',
  'src/app/engineers/page.tsx',
  'src/app/organizations/page.tsx',
  'src/app/settings/page.tsx',
];

pagesToProtect.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Check if already has ProtectedRoute
  if (content.includes('ProtectedRoute')) {
    console.log(`✅ ${filePath} - Already protected`);
    return;
  }

  // Add import
  if (!content.includes("import { ProtectedRoute }")) {
    // Find the last import line
    const lines = content.split('\n');
    let lastImportIndex = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ')) {
        lastImportIndex = i;
      }
    }

    // Insert after last import
    lines.splice(lastImportIndex + 1, 0, "import { ProtectedRoute } from '@/components/auth/protected-route';");
    content = lines.join('\n');
  }

  // Find the main return statement and wrap it
  // This is a simplified approach - for complex cases, manual editing might be better
  content = content.replace(
    /export default function \w+\([^)]*\) \{[\s\S]*?return \(/,
    match => match
  );

  // For now, just add a comment for manual wrapping
  console.log(`📝 ${filePath} - Import added. Manual wrapping needed for return statement.`);
  fs.writeFileSync(fullPath, content);
});

console.log('\n✅ Done! Please manually wrap the return statements with <ProtectedRoute>...</ProtectedRoute>');
