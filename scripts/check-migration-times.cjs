/**
 * Check when migrations were run
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkMigrationTimes() {
  // Fetch ALL tasks by increasing the limit
  const { data, count } = await supabase
    .from('service_tasks')
    .select('created_at', { count: 'exact' })
    .order('created_at', { ascending: true })
    .limit(10000); // Increase limit to get all tasks

  console.log(`Fetched ${data?.length} of ${count} total tasks\n`);

  const times = {};
  data?.forEach(task => {
    // Group by minute
    const time = task.created_at.substring(0, 16); // YYYY-MM-DDTHH:MM
    times[time] = (times[time] || 0) + 1;
  });

  console.log('Tasks created by minute:\n');
  Object.entries(times).sort().forEach(([time, count]) => {
    console.log(`${time}: ${count} tasks`);
  });

  console.log(`\nTotal: ${data?.length} tasks`);
}

checkMigrationTimes().catch(console.error);
