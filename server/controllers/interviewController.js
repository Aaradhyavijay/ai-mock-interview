require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const { Pool } = require('pg');
const { PDFParse } = require('pdf-parse');
const crypto = require('crypto');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const models = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-3.5-flash'
];

const generateQuestion = async (req, res) => {
  const { role, category, difficulty, resumeText } = req.body;

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
    const { question, userAnswer, score, category, difficulty, role } = req.body;
    const userId = req.userId;

    const sessionIdString = crypto.randomUUID();

    const sessionResult = await pool.query(
      'INSERT INTO "Session" ("userId", "role", "category", "difficulty", "score", "createdAt", "sessionId") VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING id',
      [userId, role, category, difficulty, score, sessionIdString]
    );

    const sessionId = sessionResult.rows[0].id;

    await pool.query(
      'INSERT INTO "Answer" ("sessionId", "question", "userAnswer", "feedback", "score") VALUES ($1, $2, $3, $4, $5)',
      [sessionId, question, userAnswer, req.body.feedback || '', score]
    );

    res.json({ success: true, sessionId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save session' });
  }
};

const getStats = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM "Answer" a JOIN "Session" s ON a."sessionId" = s.id WHERE s."userId" = $1) as total,
         (SELECT COUNT(*) FROM "Session" WHERE "userId" = $1) as sessions,
         (SELECT ROUND(AVG(score)::numeric, 1) FROM "Session" WHERE "userId" = $1) as avgscore`,
      [userId]
    );

    const roleBreakdown = await pool.query(
      'SELECT "role", COUNT(*) as questions, ROUND(AVG(score)::numeric, 1) as avgScore FROM "Session" WHERE "userId" = $1 AND "role" IS NOT NULL GROUP BY "role" ORDER BY questions DESC',
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

// getQuestionHistory = returns the actual list of questions the user has practiced,
// with their answer, score, feedback, and session context (role/category/difficulty/date).
// Supports optional filters via query params: ?role=&category=&difficulty=
const getQuestionHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { role, category, difficulty } = req.query;

    const conditions = ['s."userId" = $1'];
    const params = [userId];

    if (role) {
      params.push(role);
      conditions.push(`s."role" = $${params.length}`);
    }
    if (category) {
      params.push(category);
      conditions.push(`s."category" = $${params.length}`);
    }
    if (difficulty) {
      params.push(difficulty);
      conditions.push(`s."difficulty" = $${params.length}`);
    }

    const result = await pool.query(
      `SELECT
         a."id",
         a."question",
         a."userAnswer",
         a."feedback",
         a."score",
         s."role",
         s."category",
         s."difficulty",
         s."createdAt"
       FROM "Answer" a
       JOIN "Session" s ON a."sessionId" = s.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY s."createdAt" DESC`,
      params
    );

    res.json({
      count: result.rows.length,
      questions: result.rows.map(r => ({
        id: r.id,
        question: r.question,
        userAnswer: r.userAnswer,
        feedback: r.feedback,
        score: r.score,
        role: r.role,
        category: r.category,
        difficulty: r.difficulty,
        date: r.createdAt
      }))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get question history' });
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

module.exports = { generateQuestion, evaluateAnswer, saveSession, getStats, getQuestionHistory, uploadResume, getResume };