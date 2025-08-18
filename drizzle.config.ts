import { Config, defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env', quiet: true }); // Explicitly load .env

// Determine which database URL to use based on environment
const getDatabaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production: use SUPABASE_DATABASE_URL from supabase.com
    if (!process.env.SUPABASE_DATABASE_URL) {
      throw new Error('SUPABASE_DATABASE_URL is required for production environment');
    }
    return process.env.SUPABASE_DATABASE_URL;
  } else {
    // Development: use NEXT_PUBLIC_DATABASE_URL (localhost)
    if (!process.env.NEXT_PUBLIC_DATABASE_URL) {
      throw new Error('NEXT_PUBLIC_DATABASE_URL is required for development environment');
    }
    return process.env.NEXT_PUBLIC_DATABASE_URL;
  }
};

const databaseUrl = getDatabaseUrl();

console.log('Drizzle config - Environment:', process.env.NODE_ENV || 'development');
console.log('Drizzle config - Database URL configured:', !!databaseUrl);

export default defineConfig({
  schema: './src/lib/supabase/schema.ts',
  dialect: 'postgresql',
  out: './migrations',
  dbCredentials: {
    url: process.env.NEXT_PUBLIC_DATABASE_URL!,
  },
  verbose: true
} satisfies Config)