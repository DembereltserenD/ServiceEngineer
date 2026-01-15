/**
 * Script to check for and remove duplicate data in Supabase
 */

/* eslint-disable @typescript-eslint/no-require-imports */
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

async function checkDuplicates() {
  console.log('Checking for duplicates in Supabase...\n');

  // Check organizations
  console.log('=== Organizations ===');
  const { data: orgs } = await supabase.from('organizations').select('id, name');
  const orgNames = new Map();
  const dupOrgs = [];
  orgs?.forEach(org => {
    if (orgNames.has(org.name)) {
      dupOrgs.push(org);
    } else {
      orgNames.set(org.name, org.id);
    }
  });
  console.log(`Total organizations: ${orgs?.length || 0}`);
  console.log(`Duplicate organizations: ${dupOrgs.length}`);
  if (dupOrgs.length > 0) {
    console.log('Duplicate org IDs:', dupOrgs.map(o => o.id).join(', '));
  }

  // Check engineers
  console.log('\n=== Engineers ===');
  const { data: engineers } = await supabase.from('engineers').select('id, full_name, employee_code');
  const engineerCodes = new Map();
  const dupEngineers = [];
  engineers?.forEach(eng => {
    const key = eng.employee_code || eng.full_name;
    if (engineerCodes.has(key)) {
      dupEngineers.push(eng);
    } else {
      engineerCodes.set(key, eng.id);
    }
  });
  console.log(`Total engineers: ${engineers?.length || 0}`);
  console.log(`Duplicate engineers: ${dupEngineers.length}`);
  if (dupEngineers.length > 0) {
    console.log('Duplicates:', dupEngineers.map(e => `${e.full_name} (ID: ${e.id})`).join(', '));
  }

  // Check buildings
  console.log('\n=== Buildings ===');
  const { data: buildings } = await supabase.from('buildings').select('id, name, organization_id');
  const buildingKeys = new Map();
  const dupBuildings = [];
  buildings?.forEach(building => {
    const key = `${building.organization_id}|${building.name}`;
    if (buildingKeys.has(key)) {
      dupBuildings.push(building);
    } else {
      buildingKeys.set(key, building.id);
    }
  });
  console.log(`Total buildings: ${buildings?.length || 0}`);
  console.log(`Duplicate buildings: ${dupBuildings.length}`);
  if (dupBuildings.length > 0) {
    console.log('Duplicate building IDs:', dupBuildings.map(b => b.id).join(', '));
  }

  // Check service tasks (this is likely where most duplicates are)
  console.log('\n=== Service Tasks ===');
  const { data: tasks } = await supabase
    .from('service_tasks')
    .select('id, organization_id, received_at, description, akt_number, original_path, created_at')
    .order('created_at', { ascending: true });

  console.log(`Total service tasks: ${tasks?.length || 0}`);

  // Group tasks by key fields to find duplicates
  const taskKeys = new Map();
  const dupTasks = [];
  const uniqueTasks = [];

  tasks?.forEach(task => {
    // Create a key from fields that should be unique
    const key = `${task.organization_id}|${task.received_at}|${task.description}|${task.akt_number}|${task.original_path}`;

    if (taskKeys.has(key)) {
      dupTasks.push(task);
    } else {
      taskKeys.set(key, task.id);
      uniqueTasks.push(task);
    }
  });

  console.log(`Unique service tasks: ${uniqueTasks.length}`);
  console.log(`Duplicate service tasks: ${dupTasks.length}`);

  if (dupTasks.length > 0) {
    console.log(`\nFirst 10 duplicate task IDs: ${dupTasks.slice(0, 10).map(t => t.id).join(', ')}`);
    console.log(`Sample duplicate created dates: ${dupTasks.slice(0, 5).map(t => t.created_at).join(', ')}`);
  }

  return {
    orgs: { total: orgs?.length || 0, duplicates: dupOrgs },
    engineers: { total: engineers?.length || 0, duplicates: dupEngineers },
    buildings: { total: buildings?.length || 0, duplicates: dupBuildings },
    tasks: { total: tasks?.length || 0, unique: uniqueTasks.length, duplicates: dupTasks }
  };
}

async function removeDuplicates(dryRun = true) {
  console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Removing duplicates...\n`);

  const stats = await checkDuplicates();

  if (stats.tasks.duplicates.length === 0) {
    console.log('\nNo duplicates found!');
    return;
  }

  console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Will remove ${stats.tasks.duplicates.length} duplicate service tasks...`);

  if (!dryRun) {
    const duplicateIds = stats.tasks.duplicates.map(t => t.id);

    // Delete in batches of 100
    const BATCH_SIZE = 100;
    for (let i = 0; i < duplicateIds.length; i += BATCH_SIZE) {
      const batch = duplicateIds.slice(i, i + BATCH_SIZE);
      const { error } = await supabase
        .from('service_tasks')
        .delete()
        .in('id', batch);

      if (error) {
        console.error(`Error deleting batch ${i / BATCH_SIZE + 1}:`, error.message);
      } else {
        console.log(`Deleted batch ${i / BATCH_SIZE + 1} (${batch.length} tasks)`);
      }
    }

    console.log('\nDeleted duplicate tasks. Verifying...');
    const newStats = await checkDuplicates();
    console.log(`\nRemaining tasks: ${newStats.tasks.total}`);
  }

  // Handle other duplicates
  if (stats.buildings.duplicates.length > 0) {
    console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Found ${stats.buildings.duplicates.length} duplicate buildings`);
    if (!dryRun) {
      const duplicateIds = stats.buildings.duplicates.map(b => b.id);
      const { error } = await supabase.from('buildings').delete().in('id', duplicateIds);
      if (error) {
        console.error('Error deleting duplicate buildings:', error.message);
      } else {
        console.log(`Deleted ${duplicateIds.length} duplicate buildings`);
      }
    }
  }

  if (stats.orgs.duplicates.length > 0) {
    console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Found ${stats.orgs.duplicates.length} duplicate organizations`);
    console.log('Note: You may need to manually handle these due to foreign key constraints');
  }

  if (stats.engineers.duplicates.length > 0) {
    console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Found ${stats.engineers.duplicates.length} duplicate engineers`);
    console.log('Note: You may need to manually handle these due to foreign key constraints');
  }
}

// Run based on command line argument
const command = process.argv[2];

if (command === 'remove') {
  removeDuplicates(false).catch(console.error);
} else if (command === 'remove-dry-run') {
  removeDuplicates(true).catch(console.error);
} else {
  checkDuplicates().catch(console.error);
}
