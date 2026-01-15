/**
 * Script to create an admin user in Supabase
 *
 * Usage:
 * node scripts/create-admin-user.cjs <email> <password>
 *
 * Example:
 * node scripts/create-admin-user.cjs admin@example.com MySecurePassword123
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
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function createAdminUser(email, password) {
  console.log('Creating admin user...\n');
  console.log(`Email: ${email}`);
  console.log(`Password: ${'*'.repeat(password.length)}\n`);

  try {
    // Create the user using Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });

    if (error) {
      console.error('❌ Error creating user:', error.message);

      // Provide helpful error messages
      if (error.message.includes('User already registered')) {
        console.log('\n💡 This user already exists. You can use this email to log in.');
        console.log('If you forgot the password, you can reset it in Supabase Dashboard:');
        console.log(`   ${SUPABASE_URL.replace('.supabase.co', '')}/project/default/auth/users`);
      } else if (error.message.includes('Password should be')) {
        console.log('\n💡 Password requirements:');
        console.log('   - At least 6 characters');
        console.log('   - Consider using a strong password with letters, numbers, and symbols');
      }

      return;
    }

    console.log('✅ Admin user created successfully!\n');
    console.log('User details:');
    console.log(`   ID: ${data.user?.id}`);
    console.log(`   Email: ${data.user?.email}`);
    console.log(`   Created: ${data.user?.created_at}\n`);
    console.log('You can now log in at: http://localhost:3000/login');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);
    console.log('🔐 IMPORTANT: Save these credentials in a secure location!');

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

// Get email and password from command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.error('❌ Missing arguments!\n');
  console.log('Usage:');
  console.log('  node scripts/create-admin-user.cjs <email> <password>\n');
  console.log('Example:');
  console.log('  node scripts/create-admin-user.cjs admin@example.com MySecurePassword123\n');
  process.exit(1);
}

const [email, password] = args;

// Validate email
if (!email.includes('@')) {
  console.error('❌ Invalid email address!');
  process.exit(1);
}

// Validate password
if (password.length < 6) {
  console.error('❌ Password must be at least 6 characters long!');
  process.exit(1);
}

createAdminUser(email, password).catch(console.error);
