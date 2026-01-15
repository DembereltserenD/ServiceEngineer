/**
 * Get true counts by status directly
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getTrueCounts() {
  console.log('Getting true counts...\n');

  // Get all statuses first
  const { data: statuses } = await supabase.from('task_statuses').select('*');

  console.log('Statuses in database:');
  statuses?.forEach(s => console.log(`   ${s.name} (ID: ${s.id})`));

  // Count by each status ID
  console.log('\nCounts by status:');
  let totalCounted = 0;

  for (const status of statuses || []) {
    const { count } = await supabase
      .from('service_tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status_id', status.id);

    console.log(`   ${status.name}: ${count}`);
    totalCounted += count || 0;
  }

  console.log(`\nTotal by status: ${totalCounted}`);

  // Get absolute total
  const { count: absoluteTotal } = await supabase
    .from('service_tasks')
    .select('*', { count: 'exact', head: true });

  console.log(`Absolute total: ${absoluteTotal}`);
  console.log(`Difference: ${absoluteTotal - totalCounted}`);
}

getTrueCounts().catch(console.error);
