import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

try {
  await sql`CREATE DATABASE "dynamic-active-lms"`;
  console.log('Database created successfully!');
} catch (error) {
  console.error('Error creating database:', error.message);
}

await sql.end();