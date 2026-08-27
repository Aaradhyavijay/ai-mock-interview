const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const interviewRoutes = require('./routes/interview');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'AI Mock Interview API running ✅' });
});

// Public platform-wide stats — total users & total questions practiced across everyone
app.get('/api/platform-stats', async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    const usersResult = await pool.query('SELECT COUNT(*) as total FROM "User"');
    const questionsResult = await pool.query('SELECT COUNT(*) as total FROM "Session"');
    const sessionsResult = await pool.query('SELECT COUNT(DISTINCT "sessionId") as total FROM "Session" WHERE "sessionId" IS NOT NULL');
    const avgScoreResult = await pool.query('SELECT ROUND(AVG(score), 1) as avg FROM "Session" WHERE score IS NOT NULL');

    res.json({
      totalUsers: parseInt(usersResult.rows[0].total) || 0,
      totalQuestionsPracticed: parseInt(questionsResult.rows[0].total) || 0,
      totalInterviewSessions: parseInt(sessionsResult.rows[0].total) || 0,
      platformAvgScore: parseFloat(avgScoreResult.rows[0].avg) || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/migrate', async (req, res) => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT NOW()
      )
    `);
    res.json({ message: 'Tables created!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));