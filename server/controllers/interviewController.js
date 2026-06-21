const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateQuestion = async (req, res) => {
  try {
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

const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    res.json({ success: true, data: parsed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate question' });
  }
};

module.exports = { generateQuestion };