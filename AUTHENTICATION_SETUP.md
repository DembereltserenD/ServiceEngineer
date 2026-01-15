# Authentication Setup Guide

Your admin authentication is already configured in the code! Here's how to enable it and create admin users.

## Current Setup

✅ **Already Implemented:**
- Login page at `/login`
- Protected admin routes (redirects to login if not authenticated)
- Auth context for managing user sessions
- Logout functionality in the header

## Step 1: Enable Authentication in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `ahreehxyopbhjxeimvfv`
3. Navigate to **Authentication** in the left sidebar
4. Go to **Providers** tab
5. Make sure **Email** provider is enabled
6. Configure email settings:
   - For development: Enable "Confirm email" = OFF (so you don't need to verify emails)
   - For production: Set up email templates and SMTP

## Step 2: Get Your Service Role Key

To create users programmatically, you need the Service Role Key:

1. In Supabase Dashboard, go to **Settings** > **API**
2. Find **Service Role Key** (keep this secret!)
3. Add it to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ahreehxyopbhjxeimvfv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

## Step 3: Create an Admin User

### Option A: Using the Script (Recommended)

```bash
node scripts/create-admin-user.cjs admin@example.com YourSecurePassword123
```

### Option B: Using Supabase Dashboard

1. Go to **Authentication** > **Users** in Supabase Dashboard
2. Click **Add user** > **Create new user**
3. Enter email and password
4. Check "Auto Confirm User" to skip email verification
5. Click **Create user**

### Option C: Using SQL (if script doesn't work)

Run this in the Supabase SQL Editor:

```sql
-- This will be available after enabling auth
SELECT auth.create_user('{
  "email": "admin@example.com",
  "password": "YourSecurePassword123",
  "email_confirm": true
}'::jsonb);
```

## Step 4: Test Authentication

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/admin
   - You should be redirected to `/login`

3. Log in with your admin credentials

4. After successful login, you'll be redirected to `/admin`

## Current Admin Pages

Once logged in, you can access:
- `/admin` - Admin Dashboard
- `/admin/organizations` - Manage Organizations
- `/admin/buildings` - Manage Buildings
- `/admin/engineers` - Manage Engineers
- `/admin/system-types` - Manage System Types
- `/admin/call-types` - Manage Call Types
- `/admin/task-statuses` - Manage Task Statuses
- `/admin/tasks` - Manage Service Tasks

## Security Notes

🔐 **Important Security Practices:**

1. **Never commit** your `SUPABASE_SERVICE_KEY` to version control
2. **Use strong passwords** for admin accounts
3. **Enable Row Level Security (RLS)** in Supabase for all tables
4. Consider implementing **role-based access control** if you need multiple admin levels

## Troubleshooting

### "User already registered" error
The user already exists. Try logging in or reset the password in Supabase Dashboard.

### "Invalid login credentials" error
- Check if the email/password are correct
- Verify the user exists in Supabase Dashboard > Authentication > Users
- Make sure email is confirmed (or confirmation is disabled)

### Redirected to login even after signing in
- Check browser console for errors
- Verify Supabase URL and Anon Key are correct in `.env.local`
- Clear browser cookies and try again

### Can't create users with the script
- Make sure you have the `SUPABASE_SERVICE_KEY` in `.env.local`
- Check that Authentication is enabled in your Supabase project
- Try creating a user manually in the Supabase Dashboard instead

## Adding More Admin Users

To add more admin users, use the same script:

```bash
node scripts/create-admin-user.cjs user2@example.com AnotherPassword456
node scripts/create-admin-user.cjs user3@example.com YetAnotherPass789
```

## Next Steps

- [ ] Enable authentication in Supabase Dashboard
- [ ] Get Service Role Key and add to `.env.local`
- [ ] Create your first admin user
- [ ] Test login functionality
- [ ] Consider setting up Row Level Security (RLS) policies
- [ ] Set up email templates for production
