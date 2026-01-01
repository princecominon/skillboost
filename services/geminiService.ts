/// <reference types="vite/client" />
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from '../lib/supabase';

// Initialize the API Client
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_API_KEY);

// STRICT REQUEST: Using gemini-3-flash-preview
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

// ==========================================
// 1. QUIZ & LEADERBOARD FUNCTIONS
// ==========================================

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

    const result = await model.generateContent(prompt);
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
// 2. DASHBOARD FUNCTIONS
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
    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Video Analysis Error:", error);
    return {
      industrialTitle: "Lecture Analysis Unavailable",
      summary: "Could not analyze video content at this time.",
      recoveryPoints: ["Check internet connection", "Verify video URL", "Try again later"],
      concepts: ["N/A"]
    };
  }
};

export const findRecoveryVideos = async (skill: string) => {
  try {
    const prompt = `Suggest a specific, real high-quality YouTube video title and search query for learning "${skill}". Return JSON: { title, rationale }`;
    const result = await model.generateContent(prompt);
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
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
  } catch (e) {
    return [];
  }
};

export const getRecoveryPath = async (concept: string) => {
  try {
    const prompt = `
      Generate a 3-step recovery path for "${concept}".
      Return JSON: { "concept": "${concept}", "steps": [{ "title": "...", "description": "...", "resourceType": "video" }] }
    `;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
  } catch (e) {
    return null;
  }
};

export const getCareerAssessment = async (skills: string[], major: string) => {
  try {
    const prompt = `
      Assess a ${major} student with skills: ${skills.join(', ')}.
      Write 3 short paragraphs: 1. Top Roles, 2. Missing Skills, 3. Motivational Summary.
    `;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    return "Assessment unavailable.";
  }
};