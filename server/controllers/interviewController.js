const { GoogleGenAI } = require('@google/genai');

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
      console.log(`Trying model: ${model}`);
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });

      const text = response.text;
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      console.log(`Success with model: ${model}`);
      return res.json({ success: true, data: parsed });
    } catch (err) {
      console.error(`Model ${model} failed:`, err.message);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return res.status(500).json({ error: 'All models failed. Please try again.' });
};

module.exports = { generateQuestion };