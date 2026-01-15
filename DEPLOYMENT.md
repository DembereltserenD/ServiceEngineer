# Deployment Guide - Digital Power Service Dashboard

## Prerequisites

- Supabase account and project
- Vercel account
- GitHub repository

## 1. Supabase Setup

### Create Database Schema

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Run the schema file: `supabase/schema.sql`

### Get API Keys

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **anon public key** (for client-side)
   - **service_role key** (for server-side, keep secret!)

### Enable Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. For development: Disable "Confirm email"
4. For production: Configure email templates

### Import Data

Run the migration script locally:

```bash
# Make sure you have .env.local with Supabase credentials
node scripts/migrate-to-supabase.cjs
```

## 2. Vercel Deployment

### Option A: Deploy via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_KEY=your-service-role-key
   ```
4. Click **Deploy**

### Option B: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_KEY

# Deploy to production
vercel --prod
```

## 3. Create Admin User

After deployment, create an admin user:

### Option A: Using Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter email and password
4. Check **Auto Confirm User**
5. Click **Create user**

### Option B: Using the Script (Locally)

```bash
node scripts/create-admin-user.cjs admin@yourdomain.com YourPassword123
```

## 4. Verify Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. You should be redirected to `/login`
3. Log in with admin credentials
4. Verify dashboard shows correct data
5. Test admin CRUD operations at `/admin`

## Environment Variables Reference

| Variable | Required | Where | Description |
|----------|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Client & Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Client & Server | Public anon key (safe to expose) |
| `SUPABASE_SERVICE_KEY` | ⚠️ Server only | Server | Service role key (keep secret!) |

## Troubleshooting

### Build Fails

- Check all environment variables are set in Vercel
- Run `npm run build` locally to test
- Check build logs in Vercel dashboard

### Authentication Not Working

- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Ensure user exists in Supabase Auth

### Data Not Showing

- Verify database has data (run migration script)
- Check Supabase RLS policies if enabled
- Check browser console for errors

### "Invalid JWT" Errors

- Service key might be wrong or expired
- Check environment variables in Vercel

## Post-Deployment

1. **Set up custom domain** (optional)
   - Vercel → Project Settings → Domains

2. **Enable RLS** (recommended for production)
   - Run SQL in Supabase:
   ```sql
   ALTER TABLE service_tasks ENABLE ROW LEVEL SECURITY;
   ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
   -- etc.
   ```

3. **Configure email templates** for auth
   - Supabase → Authentication → Email Templates

4. **Set up monitoring**
   - Vercel → Project → Analytics
   - Supabase → Project → Reports

## Security Checklist

- [ ] SUPABASE_SERVICE_KEY is set as **secret** in Vercel (not exposed)
- [ ] `.env.local` is not committed to git
- [ ] Admin users have strong passwords
- [ ] Supabase project has 2FA enabled
- [ ] Consider enabling RLS for production
- [ ] Review Supabase security logs regularly

## Support

For issues, check:
- Vercel deployment logs
- Supabase project logs
- Browser console errors
- GitHub Issues
