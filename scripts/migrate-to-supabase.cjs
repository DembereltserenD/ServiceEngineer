/**
 * Migration Script: Excel to Supabase
 *
 * Usage:
 * 1. Set environment variables:
 *    - SUPABASE_URL
 *    - SUPABASE_SERVICE_KEY (use service key, not anon key for migration)
 * 2. Run: node scripts/migrate-to-supabase.js
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials!');
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Parse engineer string like "Ganbileg Bayanjargal [DP];#57"
function parseEngineer(str) {
  if (!str || str === 'Unknown') return null;
  const match = str.match(/^(.+?)\s*\[.*?\];#(\d+)/);
  if (match) {
    return { name: match[1].trim(), code: match[2] };
  }
  // Try without code
  const nameMatch = str.match(/^(.+?)\s*\[.*?\]/);
  if (nameMatch) {
    return { name: nameMatch[1].trim(), code: null };
  }
  return { name: str.trim(), code: null };
}

// Convert Excel date serial number to JavaScript Date
function excelDateToJS(serial) {
  if (!serial) return null;
  if (typeof serial === 'string') {
    const date = new Date(serial);
    if (!isNaN(date.getTime())) return date;
    return null;
  }
  // Excel serial date (days since 1900-01-01)
  const utc_days = Math.floor(serial - 25569);
  const utc_value = utc_days * 86400;
  return new Date(utc_value * 1000);
}

async function migrate() {
  console.log('Starting migration...\n');

  // Read Excel file
  const workbook = XLSX.readFile(path.join(__dirname, '..', 'Task20260113.xlsx'));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rawData = XLSX.utils.sheet_to_json(sheet);

  console.log(`Found ${rawData.length} records in Excel file.\n`);

  // Step 1: Collect unique values
  const uniqueOrgs = new Set();
  const uniqueBuildings = new Map(); // org name -> Set of building names
  const uniqueEngineers = new Map(); // name -> code
  const uniqueSystemTypes = new Set();
  const uniqueCallTypes = new Set();

  rawData.forEach(row => {
    if (row['Байгууллагын нэр']) {
      uniqueOrgs.add(row['Байгууллагын нэр']);

      // Collect buildings for this organization
      if (row['Байр'] && row['Байр'] !== 'nan' && row['Байр'].trim()) {
        if (!uniqueBuildings.has(row['Байгууллагын нэр'])) {
          uniqueBuildings.set(row['Байгууллагын нэр'], new Set());
        }
        uniqueBuildings.get(row['Байгууллагын нэр']).add(row['Байр']);
      }
    }

    const engineer = parseEngineer(row['Томилогдсон инженер']);
    if (engineer) {
      uniqueEngineers.set(engineer.name, engineer.code);
    }

    if (row['Системийн төрөл']) uniqueSystemTypes.add(row['Системийн төрөл']);
    if (row['Дуудлагын төрөл'] && row['Дуудлагын төрөл'] !== 'Unknown') {
      // Handle combined types like 'Бусад;#СӨХ-ийн дуудлага'
      const types = row['Дуудлагын төрөл'].split(';#');
      types.forEach(t => uniqueCallTypes.add(t.trim()));
    }
  });

  console.log(`Unique organizations: ${uniqueOrgs.size}`);
  console.log(`Unique buildings: ${Array.from(uniqueBuildings.values()).reduce((sum, set) => sum + set.size, 0)}`);
  console.log(`Unique engineers: ${uniqueEngineers.size}`);
  console.log(`Unique system types: ${uniqueSystemTypes.size}`);
  console.log(`Unique call types: ${uniqueCallTypes.size}\n`);

  // Step 2: Insert organizations
  console.log('Inserting organizations...');
  const orgMap = new Map();
  for (const name of uniqueOrgs) {
    const { data, error } = await supabase
      .from('organizations')
      .upsert({ name }, { onConflict: 'name' })
      .select()
      .single();

    if (error) {
      console.error(`Error inserting org ${name}:`, error.message);
    } else {
      orgMap.set(name, data.id);
    }
  }
  console.log(`Inserted ${orgMap.size} organizations.\n`);

  // Step 3: Insert buildings (with duplicate prevention)
  console.log('Inserting buildings...');
  const buildingMap = new Map(); // "org_name|building_name" -> building_id
  let buildingCount = 0;

  for (const [orgName, buildingNames] of uniqueBuildings) {
    const orgId = orgMap.get(orgName);
    if (!orgId) {
      console.warn(`Organization not found for buildings: ${orgName}`);
      continue;
    }

    for (const buildingName of buildingNames) {
      // First check if building already exists
      const { data: existing } = await supabase
        .from('buildings')
        .select()
        .eq('organization_id', orgId)
        .eq('name', buildingName)
        .maybeSingle();

      if (existing) {
        // Building already exists, use it
        buildingMap.set(`${orgName}|${buildingName}`, existing.id);
        buildingCount++;
      } else {
        // Insert new building
        const { data, error } = await supabase
          .from('buildings')
          .insert({ organization_id: orgId, name: buildingName })
          .select()
          .single();

        if (error) {
          console.error(`Error inserting building ${buildingName}:`, error.message);
        } else if (data) {
          buildingMap.set(`${orgName}|${buildingName}`, data.id);
          buildingCount++;
        }
      }
    }
  }
  console.log(`Processed ${buildingCount} buildings.\n`);

  // Step 4: Insert engineers
  console.log('Inserting engineers...');
  const engineerMap = new Map();
  for (const [name, code] of uniqueEngineers) {
    const { data, error } = await supabase
      .from('engineers')
      .upsert({ full_name: name, employee_code: code }, { onConflict: 'employee_code' })
      .select()
      .single();

    if (error) {
      // Try without employee_code conflict
      const { data: data2, error: error2 } = await supabase
        .from('engineers')
        .insert({ full_name: name, employee_code: code })
        .select()
        .single();

      if (error2) {
        console.error(`Error inserting engineer ${name}:`, error2.message);
      } else if (data2) {
        engineerMap.set(name, data2.id);
      }
    } else if (data) {
      engineerMap.set(name, data.id);
    }
  }
  console.log(`Inserted ${engineerMap.size} engineers.\n`);

  // Step 5: Get existing system types and call types
  console.log('Getting system types and call types...');
  const { data: systemTypes } = await supabase.from('system_types').select();
  const systemTypeMap = new Map(systemTypes?.map(st => [st.name, st.id]) || []);

  // Insert missing system types
  for (const name of uniqueSystemTypes) {
    if (!systemTypeMap.has(name)) {
      const { data } = await supabase
        .from('system_types')
        .insert({ name })
        .select()
        .single();
      if (data) systemTypeMap.set(name, data.id);
    }
  }

  const { data: callTypes } = await supabase.from('call_types').select();
  const callTypeMap = new Map(callTypes?.map(ct => [ct.name, ct.id]) || []);

  // Insert missing call types
  for (const name of uniqueCallTypes) {
    if (!callTypeMap.has(name)) {
      const { data } = await supabase
        .from('call_types')
        .insert({ name })
        .select()
        .single();
      if (data) callTypeMap.set(name, data.id);
    }
  }

  // Step 6: Get status IDs
  const { data: statuses } = await supabase.from('task_statuses').select();
  const statusMap = new Map(statuses?.map(s => [s.name, s.id]) || []);
  console.log(`Status map:`, Object.fromEntries(statusMap));

  // Step 7: Insert service tasks with duplicate checking
  console.log('\nInserting service tasks...');

  // First, get all existing tasks to check for duplicates
  console.log('Fetching existing tasks to prevent duplicates...');
  const { data: existingTasks } = await supabase
    .from('service_tasks')
    .select('organization_id, received_at, original_path, akt_number');

  const existingTaskKeys = new Set();
  existingTasks?.forEach(task => {
    // Create a unique key from fields that identify a task
    const key = `${task.organization_id}|${task.received_at}|${task.original_path || 'null'}|${task.akt_number || 'null'}`;
    existingTaskKeys.add(key);
  });

  console.log(`Found ${existingTaskKeys.size} existing tasks in database`);

  const BATCH_SIZE = 100;
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
    const batch = rawData.slice(i, i + BATCH_SIZE);

    const tasks = batch.map(row => {
      const engineer = parseEngineer(row['Томилогдсон инженер']);
      const receivedAt = excelDateToJS(row['Дуудлага хүлээн авсан огноо']);
      const completedAt = excelDateToJS(row['Дууссан огноо']);

      // Get status - default to 'Not started' if unknown
      let statusName = row['Төлөв'];
      if (!statusName || statusName === 'Unknown') statusName = 'Not started';

      // Get call type (handle combined types)
      let callTypeName = row['Дуудлагын төрөл'];
      if (callTypeName && callTypeName.includes(';#')) {
        callTypeName = callTypeName.split(';#')[0].trim();
      }

      // Get building ID if available
      let buildingId = null;
      if (row['Байр'] && row['Байр'] !== 'nan' && row['Байр'].trim() && row['Байгууллагын нэр']) {
        const buildingKey = `${row['Байгууллагын нэр']}|${row['Байр']}`;
        buildingId = buildingMap.get(buildingKey) || null;
      }

      const orgId = orgMap.get(row['Байгууллагын нэр']) || null;
      const receivedAtISO = receivedAt ? receivedAt.toISOString() : new Date().toISOString();
      const originalPath = row['Path'] || null;
      const aktNumber = row['АКТ'] ? parseInt(row['АКТ']) : null;

      return {
        organization_id: orgId,
        building_id: buildingId,
        assigned_engineer_id: engineer ? engineerMap.get(engineer.name) : null,
        status_id: statusMap.get(statusName) || statusMap.get('Not started'),
        system_type_id: systemTypeMap.get(row['Системийн төрөл']) || null,
        call_type_id: callTypeMap.get(callTypeName) || null,
        description: row['Шалтгаан'] || null,
        engineering_comment: row['Engineering Comment'] || null,
        akt_number: aktNumber,
        received_at: receivedAtISO,
        completed_at: completedAt ? completedAt.toISOString() : null,
        original_path: originalPath,
        // Add unique key for duplicate checking
        _uniqueKey: `${orgId}|${receivedAtISO}|${originalPath || 'null'}|${aktNumber || 'null'}`
      };
    }).filter(task => task.received_at); // Only valid tasks

    // Filter out tasks that already exist
    const newTasks = tasks.filter(task => !existingTaskKeys.has(task._uniqueKey));
    skipped += tasks.length - newTasks.length;

    if (newTasks.length === 0) {
      console.log(`Batch ${i / BATCH_SIZE + 1}: All tasks already exist, skipping...`);
      continue;
    }

    // Remove the _uniqueKey before inserting
    const tasksToInsert = newTasks.map(({ _uniqueKey, ...task }) => task);

    const { error } = await supabase
      .from('service_tasks')
      .insert(tasksToInsert);

    if (error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} error:`, error.message);
      errors += newTasks.length;
    } else {
      inserted += tasksToInsert.length;
      // Add to existing keys to prevent duplicates within this run
      newTasks.forEach(task => existingTaskKeys.add(task._uniqueKey));
    }

    // Progress update
    if ((i + BATCH_SIZE) % 500 === 0 || i + BATCH_SIZE >= rawData.length) {
      console.log(`Progress: ${Math.min(i + BATCH_SIZE, rawData.length)}/${rawData.length} (inserted: ${inserted}, skipped: ${skipped})`);
    }
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`Inserted: ${inserted} tasks`);
  console.log(`Skipped (already exist): ${skipped} tasks`);
  console.log(`Errors: ${errors}`);

  // Verify counts
  const { count } = await supabase
    .from('service_tasks')
    .select('*', { count: 'exact', head: true });

  console.log(`\nTotal tasks in database: ${count}`);
}

migrate().catch(console.error);
