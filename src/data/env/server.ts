import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_HOST: z.string().min(1),
    DATABASE_NAME: z.string().min(1),
    DATABASE_PASSWORD: z.string().min(1),
    DATABASE_USER: z.string().min(1),
  },
  experimental__runtimeEnv: process.env,
});