// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { drizzle as drizzleSQLite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import Database from 'better-sqlite3';
import ws from 'ws';

import * as sqliteSchema from '../shared/schema'; 
import * as pgSchema from '../shared/schema'; // Postgres schema

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set. Did you forget to provision a database?');
}

const isLocalSQLite = process.env.DATABASE_URL.startsWith('sqlite:');

let db: any;
let sqlite: Database.Database | null = null;

if (isLocalSQLite) {
  // SQLite (local development)
  const dbPath = process.env.DATABASE_URL.replace('sqlite:', '');
  sqlite = new Database(dbPath);
  db = drizzleSQLite(sqlite, { schema: sqliteSchema });
  console.log(`🗄️ Using SQLite at ${dbPath}`);
} else {
  // Neon Postgres (production or cloud dev)
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon(pool, { schema: pgSchema });
  console.log('🐘 Using Neon PostgreSQL');
}

export { db, sqlite };
