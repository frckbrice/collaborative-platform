import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';
import * as schema from '../../../migrations/schema';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
dotenv.config({ path: '.env' });

//just cckeck if we have DB link
if (!process.env.NEXT_PUBLIC_DATABASE_URL) {
  console.log(' 🔴 cannot find database url');
}

//query the DB and migrate also migrate our DB
const client = postgres(process.env.NEXT_PUBLIC_DATABASE_URL as string, { max: 1 });
const db = drizzle(client, { schema: schema });
const migrateDb = async () => {
  try {
    console.log('Migrating client from supabase DB file');
    await migrate(db, { migrationsFolder: 'migrations' });
    console.log(' 🟢 successfully migrated');
  } catch (error) {
    console.log(' 🔴 Failed to migrate client');
    console.log(error);
  }
};

const dbClient = async () => await migrateDb();
export default db;
