import { defineConfig } from "drizzle-kit";
import { env } from "./src/data/env/server";

export default defineConfig({
    out: "./src/drizzle/migrations",
    schema: "./src/drizzle/schema.ts",
    dialect: "postgresql",
    strict: true,
    verbose: true,
    dbCredentials: {
        host: env.DATABASE_HOST,
        database: env.DATABASE_NAME,
        password: env.DATABASE_PASSWORD,
        user: env.DATABASE_USER,
        ssl: false,
    }
});