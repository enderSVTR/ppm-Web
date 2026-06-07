import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 2000,
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "xkzA1",
  database: process.env.DB_NAME || "pengaduan_masyarakat",
});

export default pool;
