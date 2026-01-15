/**
 * Script to count all records in Supabase tables
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
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function countRecords() {
  console.log('Counting records in Supabase...\n');

  // Count service tasks
  const { count: tasksCount, error: tasksError } = await supabase
    .from('service_tasks')
    .select('*', { count: 'exact', head: true });

  if (tasksError) {
    console.error('Error counting service_tasks:', tasksError.message);
  } else {
    console.log(`📋 Service Tasks: ${tasksCount}`);
  }

  // Count organizations
  const { count: orgsCount } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true });
  console.log(`🏢 Organizations: ${orgsCount}`);

  // Count buildings
  const { count: buildingsCount } = await supabase
    .from('buildings')
    .select('*', { count: 'exact', head: true });
  console.log(`🏗️  Buildings: ${buildingsCount}`);

  // Count engineers
  const { count: engineersCount } = await supabase
    .from('engineers')
    .select('*', { count: 'exact', head: true });
  console.log(`👷 Engineers: ${engineersCount}`);

  // Count system types
  const { count: systemTypesCount } = await supabase
    .from('system_types')
    .select('*', { count: 'exact', head: true });
  console.log(`⚙️  System Types: ${systemTypesCount}`);

  // Count call types
  const { count: callTypesCount } = await supabase
    .from('call_types')
    .select('*', { count: 'exact', head: true });
  console.log(`📞 Call Types: ${callTypesCount}`);

  // Count task statuses
  const { count: statusesCount } = await supabase
    .from('task_statuses')
    .select('*', { count: 'exact', head: true });
  console.log(`📊 Task Statuses: ${statusesCount}`);

  // Get status breakdown
  console.log('\n📈 Status Breakdown:');
  const { data: statusBreakdown } = await supabase
    .from('service_tasks')
    .select('status_id, task_statuses(name)')
    .order('status_id');

  if (statusBreakdown) {
    const statusCounts = {};
    statusBreakdown.forEach(task => {
      const statusName = task.task_statuses?.name || 'Unknown';
      statusCounts[statusName] = (statusCounts[statusName] || 0) + 1;
    });

    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count}`);
    });
  }

  // Check for potential duplicates
  console.log('\n🔍 Checking for duplicates...');
  const { data: allTasks } = await supabase
    .from('service_tasks')
    .select('id, organization_id, received_at, description, akt_number, original_path, created_at')
    .order('created_at', { ascending: true });

  const taskKeys = new Map();
  const duplicates = [];

  allTasks?.forEach(task => {
    const key = `${task.organization_id}|${task.received_at}|${task.description}|${task.akt_number}|${task.original_path}`;
    if (taskKeys.has(key)) {
      duplicates.push(task);
    } else {
      taskKeys.set(key, task.id);
    }
  });

  console.log(`   Unique tasks: ${taskKeys.size}`);
  console.log(`   Duplicate tasks: ${duplicates.length}`);

  if (duplicates.length > 0) {
    console.log('\n⚠️  WARNING: Found duplicates!');
    console.log('   First 5 duplicate task IDs:', duplicates.slice(0, 5).map(t => t.id).join(', '));
  } else {
    console.log('\n✅ No duplicates found!');
  }
}

countRecords().catch(console.error);
