/**
 * Clean all tasks and re-migrate
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function cleanAndRemigrate() {
  console.log('⚠️  WARNING: This will delete ALL service tasks and re-import from Excel!');
  console.log('\nCurrent counts:');

  const { count } = await supabase
    .from('service_tasks')
    .select('*', { count: 'exact', head: true });

  console.log(`   Service tasks: ${count}`);
  console.log('\nStarting cleanup in 3 seconds... (Press Ctrl+C to cancel)\n');

  await new Promise(resolve => setTimeout(resolve, 3000));

  // Delete all service tasks
  console.log('Deleting all service tasks...');

  // Try simple delete without filters (delete all)
  const { error: deleteError } = await supabase
    .from('service_tasks')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Match all (dummy condition)

  if (deleteError) {
    console.error('Error with bulk delete:', deleteError.message);
    console.log('\nPlease delete manually in Supabase:');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Select your project');
    console.log('3. Go to SQL Editor');
    console.log('4. Run: DELETE FROM service_tasks;');
    console.log('\nOr use Table Editor to delete all rows.');
    process.exit(1);
  }

  console.log('✅ All tasks deleted');

  // Verify
  const { count: remainingCount } = await supabase
    .from('service_tasks')
    .select('*', { count: 'exact', head: true });

  console.log(`Remaining tasks: ${remainingCount}`);

  console.log('\n✅ Cleanup complete!');
  console.log('\nNow run the migration:');
  console.log('   node scripts/migrate-to-supabase.cjs');
}

cleanAndRemigrate().catch(console.error);
