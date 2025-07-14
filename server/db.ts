// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import { drizzle } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import Database from 'better-sqlite3';
import ws from "ws";
import * as sqliteSchema from "../shared/schema-sqlite";
import * as pgSchema from "../shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Determine if we're using SQLite or PostgreSQL
const isLocalSQLite = process.env.DATABASE_URL.startsWith('sqlite:');

let db: any;

if (isLocalSQLite) {
  // Local SQLite setup
  const sqlite = new Database(process.env.DATABASE_URL.replace('sqlite:', ''));
  db = drizzle(sqlite, { schema: sqliteSchema });
} else {
  // Neon PostgreSQL setup
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeon({ client: pool, schema: pgSchema });
}

export { db };