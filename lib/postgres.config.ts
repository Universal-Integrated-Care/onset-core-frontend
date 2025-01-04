import { Pool } from "pg";

export const {
  DATABASE_URL, // Add your database URL in the environment variables
} = process.env;

if (!DATABASE_URL) {
  throw new Error("Missing DATABASE_URL environment variable");
}

const pool = new Pool({
  connectionString: DATABASE_URL,
});

export const query = async (
  text: string,
  params?: (string | number | boolean | Date | null)[],
) => {
  try {
    const result = await pool.query(text, params);
    return result.rows;
  } catch (err) {
    console.error("Database query error:", err);
    throw err;
  }
};

export default pool;
