# 🚀 Real-Time Collaborative Platform - Troubleshooting & Setup Guide

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Development Environment Setup](#development-environment-setup)
- [Docker Compose Setup](#docker-compose-setup)
- [Supabase Configuration](#supabase-configuration)
- [Authentication System](#authentication-system)
- [Common Issues & Solutions](#common-issues--solutions)
- [Production Deployment](#production-deployment)
- [Performance Optimization](#performance-optimization)

---

## 🎯 Project Overview

**Real-Time Collaborative Platform** is a modern web application built with Next.js 15, featuring:

- **Real-time collaboration** with live document editing
- **Workspace management** for teams and projects
- **User authentication** via Supabase Auth
- **Subscription management** with Stripe integration
- **Collaborator management** with role-based access
- **Cross-platform compatibility** (web, mobile-responsive)

### 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth with OAuth & Email/Password
- **Real-time**: WebSocket connections
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Context, Zustand
- **Payment**: Stripe integration
- **Deployment**: Vercel, Docker

---

## 🛠️ Development Environment Setup

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git
- pnpm (recommended) or yarn

### Initial Setup

```bash
# Clone the repository
git clone <repository-url>
cd real-time-collaborative-plateform

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start development server
pnpm dev
```

---

## 🐳 Docker Compose Setup

### Local Development with Docker

Our project includes a comprehensive Docker setup for local development:

#### 1. **Main Application Container**

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - supabase
```

#### 2. **Supabase Local Development**

```yaml
supabase:
  image: supabase/supabase-dev
  ports:
    - '54321:54321' # Supabase API
    - '54322:54322' # PostgreSQL
    - '54323:54323' # Studio
  environment:
    - POSTGRES_PASSWORD=your_password
    - JWT_SECRET=your_jwt_secret
  volumes:
    - supabase_data:/var/lib/postgresql/data
```

#### 3. **Redis for Caching**

```yaml
redis:
  image: redis:alpine
  ports:
    - '6379:6379'
  volumes:
    - redis_data:/data
```

### Running with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

---

## 🔐 Supabase Configuration

### Local Development Setup

#### 1. **Supabase CLI Installation**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Initialize project
supabase init
```

#### 2. **Local Supabase Start**

```bash
# Start local Supabase
supabase start

# This will output:
# API URL: http://127.0.0.1:54321
# DB URL: postgresql://postgres:postgres@127.0.0.1:54321:54322/postgres
# Studio URL: http://127.0.0.1:54323
# Inbucket URL: http://127.0.0.1:54324
# JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
# anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 3. **Environment Variables for Local Development**

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_local_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Production Supabase Setup

#### 1. **Create Production Project**

- Go to [supabase.com](https://supabase.com)
- Create new project
- Note down project URL and API keys

#### 2. **Production Environment Variables**

```bash
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

#### 3. **Database Schema Migration**

```bash
# Generate migration from local changes
supabase db diff --schema public

# Apply migrations to production
supabase db push --db-url "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

---

## 🔑 Authentication System

### Authentication Flow

#### 1. **User Registration**

- **Email/Password**: Traditional signup with email verification
- **OAuth**: Google, GitHub integration
- **Profile Creation**: Automatic user profile creation in `users` table

#### 2. **Login Process**

- **Session Management**: JWT-based authentication
- **Middleware Protection**: Route-level authentication checks
- **Redirect Logic**: Authenticated users redirected to dashboard

#### 3. **Logout Process**

- **Session Invalidation**: Multiple logout attempts for reliability
- **State Cleanup**: Local storage, cookies, and IndexedDB clearing
- **Redirect**: Dedicated logout page for final cleanup

### Authentication Components

#### **Server Actions** (`src/lib/server-action/auth-action.ts`)

```typescript
// User login
export async function actionLoginUser(formData: FormData) {
  // Email/password authentication
  // User profile creation
  // Redirect to dashboard
}

// OAuth login
export async function socialLogin(provider: 'google' | 'github') {
  // OAuth flow initiation
  // Redirect to provider
}

// User logout
export async function actionLogoutUser() {
  // Session cleanup
  // Redirect to home
}
```

#### **API Routes** (`src/app/api/auth/callback/route.ts`)

```typescript
// OAuth callback handling
export async function GET(request: NextRequest) {
  // Exchange code for session
  // Create user profile
  // Redirect to dashboard
}
```

#### **Middleware** (`src/middleware.ts`)

```typescript
// Route protection
export async function middleware(req: NextRequest) {
  // Check authentication status
  // Redirect unauthenticated users
  // Handle public/protected routes
}
```

---

## 🚨 Common Issues & Solutions

### 1. **Authentication Issues**

#### **Problem**: OAuth redirects to `/login?error=auth_failed`

**Solution**:

- Check Supabase OAuth configuration
- Verify redirect URLs in Supabase dashboard
- Ensure environment variables are correct

#### **Problem**: Session persists after logout

**Solution**:

- Use dedicated `/logout` page for final cleanup
- Clear all browser storage (localStorage, sessionStorage, cookies)
- Implement aggressive logout with multiple attempts

#### **Problem**: Middleware redirects to wrong page

**Solution**:

- Check route configuration in `middleware.ts`
- Verify public/protected route definitions
- Ensure proper session validation

### 2. **Database Issues**

#### **Problem**: User profile not created after signup

**Solution**:

- Check `ensureUserProfile` function in `auth-utils.ts`
- Verify database permissions
- Check Supabase RLS policies

#### **Problem**: Collaborator limit not enforced

**Solution**:

- Verify subscription status checking
- Check collaborator count logic
- Ensure proper plan validation

### 3. **Build & Development Issues**

#### **Problem**: `Module not found` errors

**Solution**:

- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `pnpm install`
- Check import paths and file structure

#### **Problem**: Hydration mismatch warnings

**Solution**:

- Use `suppressHydrationWarning` for dynamic content
- Ensure consistent server/client rendering
- Check theme switching components

### 4. **Docker Issues**

#### **Problem**: Port conflicts

**Solution**:

```bash
# Check running containers
docker ps

# Stop conflicting services
docker-compose down

# Use different ports
docker-compose up -d -p 3001:3000
```

#### **Problem**: Volume mounting issues

**Solution**:

```bash
# Rebuild containers
docker-compose down
docker-compose up -d --build

# Check volume permissions
docker volume ls
docker volume inspect <volume_name>
```

---

## 🚀 Production Deployment

### Vercel Deployment

#### 1. **Environment Variables**

- Set all production environment variables in Vercel dashboard
- Ensure `NODE_ENV=production`
- Configure Supabase production URLs

#### 2. **Build Configuration**

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "outputDirectory": ".next",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

#### 3. **Domain Configuration**

- Configure custom domain in Vercel
- Update Supabase redirect URLs
- Set up SSL certificates

### Docker Production

#### 1. **Production Dockerfile**

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app ./
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

#### 2. **Production Compose**

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

---

## ⚡ Performance Optimization

### 1. **Code Splitting**

- Use dynamic imports for heavy components
- Implement route-based code splitting
- Lazy load non-critical features

### 2. **Caching Strategy**

- Implement Redis caching for database queries
- Use Next.js built-in caching
- Optimize image loading with Next.js Image

### 3. **Database Optimization**

- Add proper indexes to frequently queried columns
- Implement connection pooling
- Use database views for complex queries

### 4. **Bundle Optimization**

```bash
# Analyze bundle size
pnpm build
# Check .next/analyze for bundle analysis

# Optimize imports
pnpm add @next/bundle-analyzer
```

---

## 🔧 Development Tools

### 1. **Custom Logger**

```typescript
// src/utils/logger.ts
import { logger } from '@/utils/logger';

// Development-only logging
logger.info('User action', { userId, action });
logger.error('Error occurred', error);
logger.warn('Warning message', { context });
```

### 2. **Debug Mode**

```bash
# Enable debug bypass in middleware
?debug=bypass

# Development environment variables
NODE_ENV=development
DEBUG=true
```

### 3. **Database Tools**

```bash
# Supabase Studio (local)
http://localhost:54323

# Database connection
psql postgresql://postgres:postgres@localhost:54322/postgres

# Generate types
supabase gen types typescript --local > types/supabase.ts
```

---

## 📚 Additional Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

### Community

- [Next.js Discord](https://discord.gg/nextjs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/your-repo/issues)

### Support

- **Email**: support@yourcompany.com
- **Documentation**: `/help` page in the app
- **GitHub**: Create issues for bugs and feature requests

---

## 🎉 Getting Help

If you encounter issues not covered in this guide:

1. **Check the logs** using our custom logger
2. **Search existing issues** on GitHub
3. **Create a new issue** with detailed information
4. **Join our community** for real-time support
5. **Review the Help page** at `/help` in the application

---

_Last updated: august 2025_
_author: Avom brice_
_check my portfolio: https://maebrieporfolio.vercel.app/_
_Version: 2.0.0_
