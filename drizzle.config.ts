import { Config, defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env', quiet: true }); // Explicitly load .env


console.log('Database URL:', process.env.NEXT_PUBLIC_DATABASE_URL)
if (!process.env.NEXT_PUBLIC_DATABASE_URL)
  throw new Error('DATABASE_URL is not defined')

// export default defineConfig({
//   schema: './src/lib/supabase/schema.ts',
//   out: './migrations',
//   dialect: 'postgresql',
//   dbCredentials: {
//     // ✅ Option 1: Use full URL (recommended)
//     url: process.env.DATABASE_URL!,

//     // ✅ Option 2: OR use individual fields (if URL fails)
//     // host: 'localhost',
//     // user: 'postgres',
//     // password: process.env.PW || 'postgres',
//     // database: 'postgres',
//     // port: 54322,
//   },
//   migrations: {
//     schema: 'public',
//   },
//   verbose: true,
// });

export default defineConfig({
  schema: './src/lib/supabase/schema.ts',
  dialect: 'postgresql',
  out: './migrations',
  dbCredentials: {
    host: '127.0.0.1',
    port: 54322,
    user: 'postgres',
    password: 'postgres',
    database: 'postgres'
  },
  verbose: true
} satisfies Config)
