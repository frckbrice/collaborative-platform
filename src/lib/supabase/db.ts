import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as schema from '../../../migrations/schema';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { getDatabaseUrl } from './config';

dotenv.config({ path: '.env' });

// Check if we have DB link
const databaseUrl = getDatabaseUrl();
if (!databaseUrl) {
  console.error(' 🔴 cannot find database URL for current environment');
  throw new Error('Database URL not found');
}

console.log(' 🔵 Database URL found:', databaseUrl.substring(0, 50) + '...');

// Query the DB and migrate also migrate our DB
let client: postgres.Sql;
let db: ReturnType<typeof drizzle>;

try {
  client = postgres(databaseUrl as string, { 
    max: 1,
    connect_timeout: 10,
    idle_timeout: 20,
    max_lifetime: 60
  });
  
  db = drizzle(client, { schema: schema });
  console.log(' 🟢 Database connection established');
} catch (error) {
  console.error(' 🔴 Failed to establish database connection:', error);
  throw error;
}

const migrateDb = async () => {
  try {
    console.log(' 🔵 Attempting to migrate database...');
    await migrate(db, { migrationsFolder: 'migrations' });
    console.log(' 🟢 successfully migrated');
  } catch (error) {
    console.error(' 🔴 error migrating:', error);
    // Don't throw error, just log it
  }
};

// Only run migration in development
if (process.env.NODE_ENV === 'development') {
  migrateDb();
}

export { db };
