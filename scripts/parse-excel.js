/* eslint-disable @typescript-eslint/no-require-imports */
const XLSX = require('xlsx');
const path = require('path');

// Read the Excel file
const workbook = XLSX.readFile(path.join(__dirname, '..', 'Task2026.xlsx'));

// Get sheet names
console.log('Sheet names:', workbook.SheetNames);

// Get the first sheet
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

// Show headers (first row)
console.log('\n=== HEADERS ===');
console.log(data[0]);

// Show first 5 rows of data
console.log('\n=== SAMPLE DATA (first 5 rows) ===');
for (let i = 1; i <= Math.min(5, data.length - 1); i++) {
  console.log(`\nRow ${i}:`);
  data[0].forEach((header, idx) => {
    console.log(`  ${header}: ${data[i][idx]}`);
  });
}

// Show total count
console.log('\n=== STATISTICS ===');
console.log(`Total rows: ${data.length - 1}`);

// Get unique values for key columns
const jsonData = XLSX.utils.sheet_to_json(sheet);

// Status distribution
const statuses = {};
jsonData.forEach(row => {
  const status = row['Төлөв'] || 'Unknown';
  statuses[status] = (statuses[status] || 0) + 1;
});
console.log('\nStatus distribution:', statuses);

// System types
const systemTypes = {};
jsonData.forEach(row => {
  const type = row['Системийн төрөл'] || 'Unknown';
  systemTypes[type] = (systemTypes[type] || 0) + 1;
});
console.log('\nSystem types:', systemTypes);

// Organizations
const orgs = {};
jsonData.forEach(row => {
  const org = row['Байгууллагын нэр'] || 'Unknown';
  orgs[org] = (orgs[org] || 0) + 1;
});
console.log('\nTop organizations:');
Object.entries(orgs)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([name, count]) => console.log(`  ${name}: ${count}`));

// Engineers
const engineers = {};
jsonData.forEach(row => {
  const eng = row['Томилогдсон инженер'] || 'Unknown';
  engineers[eng] = (engineers[eng] || 0) + 1;
});
console.log('\nTop engineers:');
Object.entries(engineers)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([name, count]) => console.log(`  ${name}: ${count}`));

// Call types
const callTypes = {};
jsonData.forEach(row => {
  const type = row['Дуудлагын төрөл'] || 'Unknown';
  callTypes[type] = (callTypes[type] || 0) + 1;
});
console.log('\nCall types:', callTypes);
