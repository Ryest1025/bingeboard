import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

<<<<<<< HEAD
const isLocalSQLite = process.env.DATABASE_URL.startsWith('sqlite:');

export default defineConfig({
  out: "./migrations",
  schema: isLocalSQLite ? "./shared/schema-sqlite.ts" : "./shared/schema.ts",
  dialect: isLocalSQLite ? "sqlite" : "postgresql",
  dbCredentials: isLocalSQLite ? {
=======
const isSQLite = process.env.DATABASE_URL.startsWith('sqlite:');

export default defineConfig({
  out: "./migrations",
  schema: isSQLite ? "./shared/schema-sqlite.ts" : "./shared/schema.ts",
  dialect: isSQLite ? "sqlite" : "postgresql",
  dbCredentials: isSQLite ? {
>>>>>>> ad00a93 (🚀 Major Mobile-First Redesign & Persistent Navigation Implementation)
    url: process.env.DATABASE_URL.replace('sqlite:', '')
  } : {
    url: process.env.DATABASE_URL,
  },
});
