require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const { Pool } = require('pg');
const { PDFParse } = require('pdf-parse');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const models = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-3.5-flash'
];

const generateQuestion = async (req, res) => {
  const { role, category, difficulty, resumeText } = req.body;

  // If the user has a resume on file, ground the question in their actual background
  const resumeContext = resumeText
    ? `\n\nThe candidate's resume includes the following background — tailor the question to their actual skills/projects where relevant:\n${resumeText.slice(0, 3000)}`
    : '';

  const prompt = `You are an expert technical interviewer. Generate 1 interview question for the following:
    Role: ${role}
    Category: ${category}
    Difficulty: ${difficulty}${resumeContext}
    
    Respond in this exact JSON format only, no extra text:
    {
      "question": "your question here",
      "hints": ["hint 1", "hint 2"],
      "idealAnswer": "brief ideal answer here"
    }`;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({ model, contents: prompt });
      const text = response.text;
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      return res.json({ success: true, data: parsed });
    } catch (err) {
      console.error(`Model ${model} failed:`, err.message);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return res.status(500).json({ error: 'All models failed. Please try again.' });
};

const evaluateAnswer = async (req, res) => {
  const { question, userAnswer, idealAnswer } = req.body;

  const prompt = `You are an expert technical interviewer evaluating a candidate's answer.
  Question: ${question}
  Candidate's Answer: ${userAnswer}
  Ideal Answer (for reference): ${idealAnswer}

  Evaluate the candidate's answer and respond in this exact JSON format only, no extra text:
  {
    "score": <number from 1 to 10>,
    "strengths": "what the candidate did well, 1-2 sentences",
    "improvements": "what could be improved, 1-2 sentences",
    "verdict": "one short encouraging sentence"
  }`;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({ model, contents: prompt });
      const text = response.text;
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      return res.json({ success: true, data: parsed });
    } catch (err) {
      console.error(`Model ${model} failed:`, err.message);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return res.status(500).json({ error: 'All models failed. Please try again.' });
};

const saveSession = async (req, res) => {
  try {
    const { question, userAnswer, score, category, difficulty, sessionId, role } = req.body;
    const userId = req.userId;

    await pool.query(
      'INSERT INTO "Session" ("userId", question, "userAnswer", score, category, difficulty, "sessionId", "role", "createdAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())',
      [userId, question, userAnswer, score, category, difficulty, sessionId, role]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save session' });
  }
};

const getStats = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      'SELECT COUNT(*) as total, COUNT(DISTINCT "sessionId") as sessions, ROUND(AVG(score), 1) as avgScore FROM "Session" WHERE "userId" = $1',
      [userId]
    );

    const roleBreakdown = await pool.query(
      'SELECT "role", COUNT(*) as questions, ROUND(AVG(score), 1) as avgScore FROM "Session" WHERE "userId" = $1 AND "role" IS NOT NULL GROUP BY "role" ORDER BY questions DESC',
      [userId]
    );

    const stats = result.rows[0];
    res.json({
      questionsPracticed: parseInt(stats.total) || 0,
      sessionsCompleted: parseInt(stats.sessions) || 0,
      avgScore: parseFloat(stats.avgscore) || 0,
      roleBreakdown: roleBreakdown.rows.map(r => ({
        role: r.role,
        questions: parseInt(r.questions),
        avgScore: parseFloat(r.avgscore)
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};

// Extracts text from an uploaded PDF resume and saves it against the user's account
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const parser = new PDFParse({ data: req.file.buffer });
    const parsed = await parser.getText();
    const resumeText = parsed.text.trim();
    await parser.destroy();

    if (!resumeText) {
      return res.status(400).json({ error: 'Could not extract text from this PDF' });
    }

    const userId = req.userId;
    await pool.query(
      'UPDATE "User" SET "resumeText" = $1 WHERE id = $2',
      [resumeText, userId]
    );

    res.json({ success: true, resumeText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process resume' });
  }
};

// Returns the currently saved resume text, if any, so the frontend can pre-fill it
const getResume = async (req, res) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      'SELECT "resumeText" FROM "User" WHERE id = $1',
      [userId]
    );

    res.json({ resumeText: result.rows[0]?.resumeText || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
};

module.exports = { generateQuestion, evaluateAnswer, saveSession, getStats, uploadResume, getResume };