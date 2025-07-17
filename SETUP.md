# Local Supabase Authentication Setup Guide

## 🚀 Quick Start

### 1. Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ installed
- Git installed

### 2. Environment Setup

1. **Copy environment file:**
   ```bash
   cp env.example .env.local
   ```

2. **Update `.env.local` with your values:**
   ```env
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:5430
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJh...
   NEXT_PUBLIC_DATABASE_URL=postgres://postgres:postgres@localhost:54322/postgres
   ```

### 3. Start Local Supabase

1. **Start Docker Desktop**

2. **Run the start script:**
   ```bash
   chmod +x start-local-supabase.sh
   ./start-local-supabase.sh
   ```

3. **Verify services are running:**
   ```bash
   docker-compose ps
   ```

### 4. Start Next.js Application

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Visit the application:**
   - Open http://localhost:3000
   - Try signing up with email/password

## 🔧 Service URLs

- **Supabase API**: http://localhost:5430
- **Auth Service**: http://localhost:5430/auth/v1/
- **PostgREST**: http://localhost:5430/rest/v1/
- **Realtime**: http://localhost:5430/realtime/v1/
- **Storage**: http://localhost:5430/storage/v1/
- **Database**: localhost:54322
- **MailHog UI**: http://localhost:8025

## 📧 Email Testing

- **MailHog Web UI**: http://localhost:8025
- **SMTP Server**: localhost:1025
- All emails sent by the auth service will be captured by MailHog

## 🔑 Test Credentials

- **Anon Key**: `eyJ...`
- **Service Key**: `eyJ...`

## 🛠️ Troubleshooting

### Common Issues

1. **Docker not running:**
   ```bash
   # Start Docker Desktop first
   # Then run the start script
   ```

2. **Port conflicts:**
   ```bash
   # Check if ports are in use
   lsof -i :5430
   lsof -i :54322
   lsof -i :8025
   ```

3. **Database connection issues:**
   ```bash
   # Check database logs
   docker-compose logs supabase-db
   ```

4. **Auth service not responding:**
   ```bash
   # Check auth service logs
   docker-compose logs supabase-auth
   ```

5. **Email not working:**
   - Check MailHog UI at http://localhost:8025
   - Verify SMTP configuration in docker-compose.yml

### Reset Everything

```bash
# Stop all services
docker-compose down

# Remove all volumes
docker volume rm real-time-collaborative-plateform_supabase_db_data real-time-collaborative-plateform_supabase_storage_data

# Start fresh
./start-local-supabase.sh
```

## 📝 Useful Commands

```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f supabase-auth

# Access database
docker-compose exec supabase-db psql -U postgres -d postgres

# Restart specific service
docker-compose restart supabase-auth

# Check service health
curl http://localhost:5430/health
```

## 🔐 OAuth Setup

See `oauth-setup.md` for detailed instructions on setting up Google and GitHub OAuth providers.

## 📊 Monitoring

- **Service Status**: `docker-compose ps`
- **Resource Usage**: `docker stats`
- **Logs**: `docker-compose logs -f`
- **Health Check**: `curl http://localhost:5430/health` 