# Real-Time Collaborative Platform Troubleshooting Guide

This document contains solutions for common issues encountered when setting up and running the real-time collaborative platform.

## 🔐 Authentication Issues

### Issue 1: "user from dashboard page: null"

**Problem**: User is not detected after successful login, dashboard shows null user.

**Root Cause**: Server-side Supabase client was not properly configured for authentication.

**Solution**:

1. **Update server-side client** (`src/utils/server.ts`):

   ```typescript
   import { createServerClient, type CookieOptions } from '@supabase/ssr';
   import { cookies } from 'next/headers';

   export async function createClient() {
     const cookieStore = await cookies();
     return createServerClient(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           get(name: string) {
             return cookieStore.get(name)?.value;
           },
           set(name: string, value: string, options: CookieOptions) {
             try {
               cookieStore.set({ name, value, ...options });
             } catch (error) {
               // Server Component context
             }
           },
           remove(name: string, options: CookieOptions) {
             try {
               cookieStore.set({ name, value: '', ...options });
             } catch (error) {
               // Server Component context
             }
           },
         },
       }
     );
   }
   ```

2. **Update auth actions** (`src/lib/server-action/auth-action.ts`):

   ```typescript
   import { createClient } from '@/utils/server';

   export async function actionLoginUser({ email, password }) {
     const supabase = await createClient();
     const response = await supabase.auth.signInWithPassword({
       email,
       password,
     });
     return response;
   }
   ```

3. **Update dashboard page** (`src/components/features/main/dashboard/dashboard-page.tsx`):

   ```typescript
   import { createClient } from '@/utils/server';

   const DashboardPage = async () => {
     const supabase = await createClient();
     const {
       data: { user },
     } = await supabase.auth.getUser();
     // ... rest of the code
   };
   ```

### Issue 2: No redirect to dashboard after login

**Problem**: User successfully logs in but doesn't get redirected to dashboard.

**Root Cause**: Middleware not properly detecting sessions or auth state not updating.

**Solution**:

1. **Add auth state listener** (`src/lib/providers/supabase-user-provider.tsx`):

   ```typescript
   useEffect(() => {
     const {
       data: { subscription },
     } = supabase.auth.onAuthStateChange(async (event, session) => {
       if (session?.user) {
         setUser(session.user);
       } else {
         setUser(null);
       }
     });
     return () => subscription.unsubscribe();
   }, [supabase]);
   ```

2. **Update middleware** (`src/middleware.ts`):

   ```typescript
   export async function middleware(req: NextRequest) {
     const supabase = await createClient();
     const {
       data: { session },
     } = await supabase.auth.getSession();

     if (req.nextUrl.pathname.startsWith('/dashboard')) {
       if (!session) {
         return NextResponse.redirect(new URL('/login', req.url));
       }
     }

     if (['/login', '/signup'].includes(req.nextUrl.pathname)) {
       if (session) {
         return NextResponse.redirect(new URL('/dashboard', req.url));
       }
     }
     return NextResponse.next();
   }
   ```

## 🗄️ Database Issues

### Issue 3: "relation 'products' does not exist" (and other tables)

**Problem**: Database tables missing, causing build errors and runtime failures.

**Root Cause**: Database schema not properly migrated or tables not created.

**Solution**:

1. **Check existing tables**:

   ```bash
   psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "\dt"
   ```

2. **Create missing tables manually**:

   ```sql
   -- Create enum types
   DO $$ BEGIN
       CREATE TYPE "subscription_status" AS ENUM ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid');
   EXCEPTION WHEN duplicate_object THEN null; END $$;

   DO $$ BEGIN
       CREATE TYPE "pricing_plan_interval" AS ENUM ('day', 'week', 'month', 'year');
   EXCEPTION WHEN duplicate_object THEN null; END $$;

   DO $$ BEGIN
       CREATE TYPE "pricing_type" AS ENUM ('one_time', 'recurring');
   EXCEPTION WHEN duplicate_object THEN null; END $$;

   -- Create missing tables
   CREATE TABLE IF NOT EXISTS "users" (
       "id" uuid PRIMARY KEY NOT NULL,
       "full_name" text,
       "avatar_url" text,
       "billing_address" jsonb,
       "payment_method" jsonb,
       "email" text,
       "updated_at" timestamp with time zone
   );

   CREATE TABLE IF NOT EXISTS "workspaces" (
       "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
       "created_at" timestamp with time zone DEFAULT now() NOT NULL,
       "workspaces_owner" uuid NOT NULL,
       "title" text NOT NULL,
       "icon_id" text NOT NULL,
       "data" text NOT NULL,
       "in_trash" text,
       "logo" text,
       "banner_url" text
   );

   -- Add other missing tables...
   ```

3. **Fix database configuration** (`src/lib/supabase/db.ts`):
   ```typescript
   // Use correct database URL, not API URL
   const client = postgres(process.env.NEXT_PUBLIC_DATABASE_URL as string, { max: 1 });
   ```

### Issue 4: JWT Secret Mismatch

**Problem**: Authentication fails due to JWT secret mismatch between Supabase CLI and environment.

**Solution**:

1. **Check Supabase CLI JWT secret**:

   ```bash
   supabase status
   ```

2. **Update .env to match**:
   ```env
   NEXT_PUBLIC_JWT_SECRET="super-secret-jwt-token-with-at-least-32-characters-long"
   ```

## 🔧 Build Issues

### Issue 5: Build errors with missing dependencies

**Problem**: `Cannot find package '@next/bundle-analyzer'` or similar.

**Solution**:

```bash
yarn add @next/bundle-analyzer
```

### Issue 6: UUID import errors

**Problem**: `uuidv4` import issues in dashboard setup.

**Solution**:

```typescript
// Change from:
import { uuid } from 'uuidv4';

// To:
import { v4 as uuid } from 'uuid';
```

## 🚀 Setup Guide

### Prerequisites

1. **Install Supabase CLI**:

   ```bash
   npm install -g supabase
   ```

2. **Install Docker Desktop** and ensure it's running

### Step 1: Start Supabase Services

```bash
# Navigate to your project directory
cd real-time-collaborative-plateform

# Start Supabase services
supabase start
```

### Step 2: Configure Environment Variables

Create `.env` file with correct values:

```env
# Supabase CLI Configuration
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Step 3: Install Dependencies

```bash
yarn install
```

### Step 4: Start Development Server

```bash
yarn dev
```

## 🐛 Debugging

### Check Authentication Flow

1. **Server logs**: Look for auth action debug output
2. **Browser console**: Check for user provider logs
3. **Network tab**: Verify cookies are being set
4. **Middleware logs**: Check session detection

### Check Database Connection

```bash
# Test database connection
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "SELECT version();"

# List all tables
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "\dt"
```

### Check Supabase Services

```bash
# Check service status
supabase status

# View logs
supabase logs
```

## 📋 Common Commands

### Database Operations

```bash
# Connect to database
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Reset database (if needed)
supabase db reset

# Generate new migration
npx drizzle-kit generate

# Push schema changes
npx drizzle-kit push
```

### Development

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Run linting
yarn lint
```

## Verification Checklist

- [ ] Supabase CLI is running (`supabase status`)
- [ ] All database tables exist (`\dt` command)
- [ ] Environment variables are correct
- [ ] JWT secret matches Supabase CLI
- [ ] Server-side client is properly configured
- [ ] Auth actions use server-side client
- [ ] User provider has auth state listener
- [ ] Middleware is properly configured
- [ ] No build errors (`yarn dev` runs successfully)
- [ ] Login redirects to dashboard
- [ ] Dashboard loads without errors

## Still Having Issues?

1. **Check the logs**: Look at server console and browser console
2. **Verify environment**: Ensure all environment variables are set correctly
3. **Test step by step**: Try each part of the auth flow individually
4. **Compare with working setup**: Use this troubleshooting guide as reference

## 📝 Recent Fixes Applied

### Authentication Fixes (Latest)

- Fixed server-side Supabase client configuration
- Updated auth actions to use server-side client
- Added proper session handling in user provider
- Fixed middleware configuration and routing
- Added debugging logs for authentication flow

### Database Fixes (Latest)

- Updated database configuration to use correct URL
- Created missing database tables and enum types
- Fixed foreign key relationships
- Resolved JWT secret mismatch

### Build Fixes (Latest)

- Fixed UUID import in dashboard setup
- Resolved merge conflicts in middleware
- Added missing dependencies
- Fixed file structure issues
