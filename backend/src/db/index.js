import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

// Add SSL configuration for RDS
const client = postgres(connectionString, {
  ssl: 'require'  // This is the key addition!
});

export const db = drizzle(client);