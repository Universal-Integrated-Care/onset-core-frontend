import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Ensure DATABASE_URL is set in your .env file
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action"); // Retrieve the `action` query parameter

  try {
    const client = await pool.connect();

    if (action === "drop") {
      // Drop tables if `action=drop` is passed
      await client.query(`DROP TABLE IF EXISTS sessions;`);
      await client.query(`DROP TABLE IF EXISTS users;`);
      console.log("Tables dropped successfully!");
      client.release();
      return NextResponse.json({ message: "Tables dropped successfully!" });
    } else {
      // Create tables by default
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone_number VARCHAR(15), -- Add phone_number (optional)
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(id) ON DELETE CASCADE,
          session_token VARCHAR(255) UNIQUE NOT NULL,
          expires TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log("Tables created successfully!");
      client.release();
      return NextResponse.json({ message: "Tables created successfully!" });
    }
  } catch (err) {
    console.error("Error executing table operations:", err);
    return NextResponse.json(
      { error: "Failed to execute table operations" },
      { status: 500 },
    );
  }
}
