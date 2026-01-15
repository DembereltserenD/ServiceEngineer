/**
 * Diagnose task issues
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function diagnose() {
  console.log('Diagnosing task issues...\n');

  // Check tasks with NULL status_id
  const { count: nullStatusCount } = await supabase
    .from('service_tasks')
    .select('*', { count: 'exact', head: true })
    .is('status_id', null);

  console.log(`Tasks with NULL status_id: ${nullStatusCount}`);

  // Check tasks by created_at date
  const { data: tasksByDate } = await supabase
    .from('service_tasks')
    .select('created_at')
    .order('created_at', { ascending: true });

  if (tasksByDate && tasksByDate.length > 0) {
    const dates = {};
    tasksByDate.forEach(task => {
      const date = task.created_at?.split('T')[0];
      dates[date] = (dates[date] || 0) + 1;
    });

    console.log('\nTasks by creation date:');
    Object.entries(dates).sort().forEach(([date, count]) => {
      console.log(`   ${date}: ${count} tasks`);
    });
  }

  // Sample some tasks to see their structure
  const { data: sampleTasks } = await supabase
    .from('service_tasks')
    .select('*')
    .limit(3);

  console.log('\nSample tasks:');
  sampleTasks?.forEach((task, i) => {
    console.log(`\nTask ${i + 1}:`);
    console.log(`   ID: ${task.id}`);
    console.log(`   Status ID: ${task.status_id}`);
    console.log(`   Organization ID: ${task.organization_id}`);
    console.log(`   Received At: ${task.received_at}`);
    console.log(`   Created At: ${task.created_at}`);
  });
}

diagnose().catch(console.error);
