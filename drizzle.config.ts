import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const isLocalSQLite = process.env.DATABASE_URL.startsWith('sqlite:');

export default defineConfig({
  out: "./migrations",
  schema: isLocalSQLite ? "./shared/schema/index.ts" : "./shared/schema.ts",
  dialect: isLocalSQLite ? "sqlite" : "postgresql",
  dbCredentials: isLocalSQLite
    ? { url: process.env.DATABASE_URL.replace('sqlite:', '') }
    : { url: process.env.DATABASE_URL },
});
