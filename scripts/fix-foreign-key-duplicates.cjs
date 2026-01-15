/**
 * Script to fix duplicate buildings and engineers by remapping foreign keys
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
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function fixBuildingDuplicates(dryRun = true) {
  console.log(`${dryRun ? '[DRY RUN] ' : ''}Fixing duplicate buildings...\n`);

  // Get all buildings
  const { data: buildings } = await supabase
    .from('buildings')
    .select('id, name, organization_id, created_at')
    .order('created_at', { ascending: true });

  // Group by org + name to find duplicates
  const buildingGroups = new Map();
  buildings?.forEach(building => {
    const key = `${building.organization_id}|${building.name}`;
    if (!buildingGroups.has(key)) {
      buildingGroups.set(key, []);
    }
    buildingGroups.get(key).push(building);
  });

  let updatedTasks = 0;
  let deletedBuildings = 0;

  // Process each group that has duplicates
  for (const [, group] of buildingGroups) {
    if (group.length > 1) {
      // Keep the oldest one (first in array due to sorting)
      const keepBuilding = group[0];
      const duplicates = group.slice(1);

      console.log(`\nBuilding: ${group[0].name}`);
      console.log(`  Keeping ID: ${keepBuilding.id} (created: ${keepBuilding.created_at})`);
      console.log(`  Duplicates: ${duplicates.length}`);

      // Update all service_tasks that reference the duplicates
      for (const dup of duplicates) {
        console.log(`  - Remapping tasks from ${dup.id} to ${keepBuilding.id}`);

        if (!dryRun) {
          const { error } = await supabase
            .from('service_tasks')
            .update({ building_id: keepBuilding.id })
            .eq('building_id', dup.id);

          if (error) {
            console.error(`    Error updating tasks: ${error.message}`);
          } else {
            // Check how many were updated
            const { count } = await supabase
              .from('service_tasks')
              .select('*', { count: 'exact', head: true })
              .eq('building_id', keepBuilding.id);
            console.log(`    Updated tasks, now ${count} tasks reference this building`);
            updatedTasks++;
          }

          // Delete the duplicate building
          const { error: deleteError } = await supabase
            .from('buildings')
            .delete()
            .eq('id', dup.id);

          if (deleteError) {
            console.error(`    Error deleting duplicate: ${deleteError.message}`);
          } else {
            console.log(`    Deleted duplicate building ${dup.id}`);
            deletedBuildings++;
          }
        }
      }
    }
  }

  console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Summary:`);
  console.log(`Updated tasks: ${updatedTasks}`);
  console.log(`Deleted duplicate buildings: ${deletedBuildings}`);
}

async function fixEngineerDuplicates(dryRun = true) {
  console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Fixing duplicate engineers...\n`);

  // Get all engineers
  const { data: engineers } = await supabase
    .from('engineers')
    .select('id, full_name, employee_code, created_at')
    .order('created_at', { ascending: true });

  // Group by employee_code or full_name to find duplicates
  const engineerGroups = new Map();
  engineers?.forEach(engineer => {
    const key = engineer.employee_code || engineer.full_name;
    if (!engineerGroups.has(key)) {
      engineerGroups.set(key, []);
    }
    engineerGroups.get(key).push(engineer);
  });

  let updatedTasks = 0;
  let deletedEngineers = 0;

  // Process each group that has duplicates
  for (const [, group] of engineerGroups) {
    if (group.length > 1) {
      // Keep the oldest one
      const keepEngineer = group[0];
      const duplicates = group.slice(1);

      console.log(`\nEngineer: ${group[0].full_name}`);
      console.log(`  Keeping ID: ${keepEngineer.id} (created: ${keepEngineer.created_at})`);
      console.log(`  Duplicates: ${duplicates.length}`);

      // Update all service_tasks that reference the duplicates
      for (const dup of duplicates) {
        console.log(`  - Remapping tasks from ${dup.id} to ${keepEngineer.id}`);

        if (!dryRun) {
          const { error } = await supabase
            .from('service_tasks')
            .update({ assigned_engineer_id: keepEngineer.id })
            .eq('assigned_engineer_id', dup.id);

          if (error) {
            console.error(`    Error updating tasks: ${error.message}`);
          } else {
            // Check how many were updated
            const { count } = await supabase
              .from('service_tasks')
              .select('*', { count: 'exact', head: true })
              .eq('assigned_engineer_id', keepEngineer.id);
            console.log(`    Updated tasks, now ${count} tasks assigned to this engineer`);
            updatedTasks++;
          }

          // Delete the duplicate engineer
          const { error: deleteError } = await supabase
            .from('engineers')
            .delete()
            .eq('id', dup.id);

          if (deleteError) {
            console.error(`    Error deleting duplicate: ${deleteError.message}`);
          } else {
            console.log(`    Deleted duplicate engineer ${dup.id}`);
            deletedEngineers++;
          }
        }
      }
    }
  }

  console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Summary:`);
  console.log(`Updated tasks: ${updatedTasks}`);
  console.log(`Deleted duplicate engineers: ${deletedEngineers}`);
}

async function run() {
  const command = process.argv[2];
  const dryRun = command !== 'fix';

  if (dryRun) {
    console.log('=== DRY RUN MODE ===');
    console.log('Running in preview mode. No changes will be made.');
    console.log('Use "node scripts/fix-foreign-key-duplicates.cjs fix" to apply changes.\n');
  }

  await fixBuildingDuplicates(dryRun);
  await fixEngineerDuplicates(dryRun);

  if (!dryRun) {
    console.log('\n=== Verification ===');
    // Verify no duplicates remain
    const { data: buildings } = await supabase.from('buildings').select('id, name, organization_id');
    const buildingKeys = new Map();
    let dupCount = 0;
    buildings?.forEach(b => {
      const key = `${b.organization_id}|${b.name}`;
      if (buildingKeys.has(key)) dupCount++;
      else buildingKeys.set(key, b.id);
    });
    console.log(`Remaining duplicate buildings: ${dupCount}`);

    const { data: engineers } = await supabase.from('engineers').select('id, full_name, employee_code');
    const engineerKeys = new Map();
    let dupEng = 0;
    engineers?.forEach(e => {
      const key = e.employee_code || e.full_name;
      if (engineerKeys.has(key)) dupEng++;
      else engineerKeys.set(key, e.id);
    });
    console.log(`Remaining duplicate engineers: ${dupEng}`);
  }
}

run().catch(console.error);
