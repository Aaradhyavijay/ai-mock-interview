require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  const result = await pool.query(`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name IN ('Session', 'Answer')
    ORDER BY table_name, ordinal_position;
  `);
  console.log(result.rows);
  await pool.end();
}

check().catch(err => console.error('DB check failed:', err));