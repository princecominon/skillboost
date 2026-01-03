/// <reference types="vite/client" />
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from '../lib/supabase';

// ==========================================
// 1. INITIALIZE SINGLE API CLIENT
// ==========================================

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

if (!API_KEY) {
  console.error("⚠️ Missing VITE_GOOGLE_API_KEY in .env file");
}

const genAI = new GoogleGenerativeAI(API_KEY);


const generateSmartContent = async (prompt: string) => {
  try {
    // Attempt 1: Advanced Model
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    return await model.generateContent(prompt);
  } catch (error: any) {
    console.warn("⚠️ Primary model failed. Switching to fallback (gemini-1.5-flash).");
    
    // Attempt 2: Fallback Model (Standard)
    // This prevents the app from breaking if you hit the rate limit.
    const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    return await fallbackModel.generateContent(prompt);
  }
};


export const generateTopicQuiz = async (topic: string) => {
  try {
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

    const result = await generateSmartContent(prompt);
    const text = result.response.text();
    const cleanText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Quiz Gen Error:", error);
    return null;
  }
};

export const saveQuizResult = async (username: string, topic: string, score: number, total: number) => {
  console.log("Saving quiz for:", username);
  const { error } = await supabase
    .from('quizzes')
    .insert([{ 
      username: username, 
      topic: topic, 
      score: score, 
      total_questions: total,
      user_major: 'Electrical Engineering' 
    }]);

  if (error) {
    console.error("Supabase Error:", error);
    return false;
  }
  return true;
};

export const getLeaderboard = async () => {
  try {
    const { data, error } = await supabase
      .from('quizzes')
      .select('username, topic, score')
      .order('score', { ascending: false })
      .limit(5);

    if (error) throw error;
    
    return data.map((entry, index) => ({
      name: entry.username || `Student ${index + 1}`,
      score: entry.score * 50,
      topic: entry.topic
    }));
  } catch (error) {
    console.error("Leaderboard Error:", error);
    return [];
  }
};

// ==========================================
// 3. VIDEO & ANALYSIS
// ==========================================

export const getYouTubeID = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const analyzeLectureVideo = async (url: string) => {
  try {
    const prompt = `
      Analyze this lecture context (simulated based on URL pattern): ${url}
      Provide a JSON response with:
      - industrialTitle: A catchy industry-relevant title
      - summary: A 2-sentence summary suitable for a CTO
      - recoveryPoints: An array of 3 bullet points on practical application
      - concepts: An array of 3 academic concepts covered
      Return JSON only.
    `;
    
    const result = await generateSmartContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    return {
      industrialTitle: "Lecture Analysis Unavailable",
      summary: "Could not analyze video content at this time.",
      recoveryPoints: [],
      concepts: ["N/A"]
    };
  }
};

export const findRecoveryVideos = async (skill: string) => {
  try {
    const prompt = `Suggest a specific, real high-quality YouTube video title and search query for learning "${skill}". Return JSON: { title, rationale }`;
    
    const result = await generateSmartContent(prompt);
    const data = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
    
    return {
      title: data.title || `Mastering ${skill}`,
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(skill + " tutorial")}`,
      rationale: data.rationale || "Highly rated for industrial application.",
      channel: "YouTube Search"
    };
  } catch (e) {
    return { title: `Learn ${skill}`, url: "", rationale: "Recommended topic.", channel: "YouTube" };
  }
};

export const recommendCourses = async (goal: string, courses: any[]) => {
  try {
    const catalogBrief = courses.map(c => ({ id: c.id, title: c.title }));
    const prompt = `
      User Goal: "${goal}"
      Courses: ${JSON.stringify(catalogBrief)}
      Select the best courses for this goal. Return a JSON array of objects: [{ "id": "...", "reason": "..." }]
    `;

    const result = await generateSmartContent(prompt);
    return JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
  } catch (e) {
    return [];
  }
};

// ==========================================
// 4. RECOVERY PATH (Action Plan)
// ==========================================

export const getRecoveryPath = async (goal: string) => {
  try {
    const prompt = `
      Create a concrete 4-step recovery path to master this goal: "${goal}".
      For each step, provide:
      1. A short action title.
      2. A concise explanation.
      3. A specific YouTube search query to find the best tutorial for this step.
      
      Return JSON only: 
      { 
        "goal": "${goal}", 
        "steps": [
          { "title": "Step Title", "description": "Step Description", "searchQuery": "YouTube Search Query" }
        ] 
      }
    `;

    const result = await generateSmartContent(prompt);
    const data = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
    
    // Add constructed YouTube links
    const stepsWithLinks = data.steps.map((step: any) => ({
      ...step,
      youtubeLink: `https://www.youtube.com/results?search_query=${encodeURIComponent(step.searchQuery)}`
    }));

    return { ...data, steps: stepsWithLinks };
  } catch (e) {
    console.error("Recovery Path Error:", e);
    return null;
  }
};

export const getCareerAssessment = async (skills: string[], major: string) => {
  try {
    const prompt = `
      Assess a ${major} student with skills: ${skills.join(', ')}.
      Write 3 short paragraphs: 1. Top Roles, 2. Missing Skills, 3. Motivational Summary.
    `;

    const result = await generateSmartContent(prompt);
    return result.response.text();
  } catch (e) {
    return "Assessment unavailable.";
  }
};