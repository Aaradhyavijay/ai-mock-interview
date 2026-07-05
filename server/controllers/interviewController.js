require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const models = [
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-3.5-flash'
];

const generateQuestion = async (req, res) => {
  const { role, category, difficulty } = req.body;

  const prompt = `You are an expert technical interviewer. Generate 1 interview question for the following:
    Role: ${role}
    Category: ${category}
    Difficulty: ${difficulty}
    
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
    const { question, userAnswer, score, category, difficulty } = req.body;
    const userId = req.userId;

    await pool.query(
      'INSERT INTO "Session" ("userId", question, "userAnswer", score, category, difficulty, "createdAt") VALUES ($1, $2, $3, $4, $5, $6, NOW())',
      [userId, question, userAnswer, score, category, difficulty]
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
      'SELECT COUNT(*) as total, ROUND(AVG(score), 1) as avgScore FROM "Session" WHERE "userId" = $1',
      [userId]
    );

    const stats = result.rows[0];
    res.json({
      questionsPracticed: parseInt(stats.total) || 0,
      avgScore: parseFloat(stats.avgscore) || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};

module.exports = { generateQuestion, evaluateAnswer, saveSession, getStats };