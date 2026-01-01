import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  // 1. Enable CORS (Allows your frontend to talk to this backend)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle browser pre-checks
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. Setup Google AI with the Server Key
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
  
  // Use the stable model with higher limits
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    // 3. Get the prompt from the frontend
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // 4. Generate the content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. Send result back to frontend
    return res.status(200).json({ output: text });

  } catch (error) {
    console.error("Backend Error:", error);
    return res.status(500).json({ error: error.message });
  }
}