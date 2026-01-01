import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // 1. Setup CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 2. Load API Key
    // We check both VITE_ and standard names to be safe
    const apiKey = process.env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "Server Configuration Error: API Key missing" });
    }

    // 3. Initialize AI
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // 4. Get the EXACT data sent by the frontend
    const { model, contents, config } = req.body;

    // ERROR FIX: We no longer check for "prompt". We check for "contents".
    if (!contents) {
      return res.status(400).json({ error: "No content provided" });
    }

    // 5. Call Google AI with YOUR specific model
    // This passes "gemini-3-flash-preview" exactly as requested
    const response = await ai.models.generateContent({
      model: model, 
      contents: contents,
      config: config
    });

    // 6. Return the result
    return res.status(200).json({ text: response.text });

  } catch (error) {
    console.error("Backend Error:", error);
    // If the model name is wrong, Google will return a 400 or 404 here
    return res.status(500).json({ error: error.message });
  }
}