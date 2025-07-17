# OAuth Setup for Local Supabase

## Prerequisites

1. **Google OAuth Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to Credentials → Create Credentials → OAuth 2.0 Client ID
   - Set Application Type to "Web application"
   - Add Authorized redirect URIs:
     - `http://localhost:5430/auth/v1/callback`
     - `http://localhost:3000/auth/callback`
   - Copy Client ID and Client Secret

2. **GitHub OAuth Setup:**
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "New OAuth App"
   - Set Application name: "Maebrie Local"
   - Set Homepage URL: `http://localhost:3000`
   - Set Authorization callback URL: `http://localhost:5430/auth/v1/callback`
   - Copy Client ID and Client Secret

## Update Docker Compose

Add these environment variables to the `supabase-auth` service in `docker-compose.yml`:

```yaml
supabase-auth:
  environment:
    # ... existing variables ...
    
    # Google OAuth
    GOTRUE_EXTERNAL_GOOGLE_ENABLED: "true"
    GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID: "google-client-id"
    GOTRUE_EXTERNAL_GOOGLE_SECRET: "google-client-secret"
    GOTRUE_EXTERNAL_GOOGLE_REDIRECT_URI: "http://localhost:5430/auth/v1/callback"
    
    # GitHub OAuth
    GOTRUE_EXTERNAL_GITHUB_ENABLED: "true"
    GOTRUE_EXTERNAL_GITHUB_CLIENT_ID: "github-client-id"
    GOTRUE_EXTERNAL_GITHUB_SECRET: "github-client-secret"
    GOTRUE_EXTERNAL_GITHUB_REDIRECT_URI: "http://localhost:5430/auth/v1/callback"
```

## Update Frontend Configuration

Add these environment variables to your `.env.local`:

```env
# OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=google-client-id
NEXT_PUBLIC_GITHUB_CLIENT_ID=github-client-id
```

## Test OAuth Flow

1. Start the local Supabase environment
2. Test Google OAuth: `http://localhost:5430/auth/v1/authorize?provider=google`
3. Test GitHub OAuth: `http://localhost:5430/auth/v1/authorize?provider=github`

## Troubleshooting

- Ensure redirect URIs match exactly
- Check that OAuth providers are enabled in the auth service
- Verify client IDs and secrets are correct
- Check MailHog for any error emails 