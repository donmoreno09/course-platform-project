import { env } from "../data/env/server"
import { drizzle } from "drizzle-orm/node-postgres"
import * as schema from "./schema"

export const db = drizzle({
    schema,
    connection: {
        password: env.DATABASE_PASSWORD,
        user: env.DATABASE_USER,
        database: env.DATABASE_NAME,
        host: env.DATABASE_HOST,
    },
})