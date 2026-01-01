/// <reference types="vite/client" />
/* FIX: We use '@google/generative-ai' (the standard SDK), 
   NOT '@google/genai' (the experimental one).
*/
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from '../lib/supabase';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

export const generateTopicQuiz = async (topic: string) => {
  try {
    // Switch to 1.5-flash to avoid quotas
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Create a difficult 5-question multiple choice quiz about "${topic}" for an engineering student.
      Return JSON only. Structure:
      [
        {
          "question": "Question text?",
          "options": ["A", "B", "C", "D"],
          "correctAnswer": 0 // index of correct option (0-3)
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("AI Service Error:", error);
    return null;
  }
};

/* FIX: This function now definitely accepts 4 arguments.
   We explicitly type them to avoid TS errors.
*/
export const saveQuizResult = async (username: string, topic: string, score: number, total: number) => {
  console.log("Saving quiz for:", username);
  
  const { data, error } = await supabase
    .from('quizzes')
    .insert([
      { 
        username: username, 
        topic: topic, 
        score: score, 
        total_questions: total,
        user_major: 'Electrical Engineering' 
      },
    ]);

  if (error) {
    console.error("Error saving to Supabase:", error);
    return false;
  }
  
  console.log("Success! Quiz saved.");
  return true;
};

export const getLeaderboard = async () => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('username, topic, score, created_at')
      .order('score', { ascending: false })
      .limit(5);

    if (error) throw error;
    
    return data.map((entry, index) => ({
      name: entry.username || `Student ${index + 1}`,
      score: entry.score * 50,
      topic: entry.topic
    }));
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};