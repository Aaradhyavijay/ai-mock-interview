require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "User" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      "createdAt" TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS "Session" (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER REFERENCES "User"(id),
      question TEXT,
      "userAnswer" TEXT,
      score INTEGER,
      category VARCHAR(100),
      difficulty VARCHAR(50),
      "createdAt" TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "sessionId" VARCHAR(100)
  `);

  await pool.query(`
    ALTER TABLE "Session" ADD COLUMN IF NOT EXISTS "role" VARCHAR(100)
  `);

  await pool.query(`
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resumeText" TEXT
  `);

  console.log('Tables created!');
  await pool.end();
}

migrate().catch(console.error);