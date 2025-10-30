import pg from "pg";
const { Pool } = pg;

export const pool = new Pool({
  host: process.env.DB_HOST || "postgres",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "paes_db",
  max: 10
});