/// <reference types="vite/client" />
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from '../lib/supabase';

// ==========================================
// 1. INITIALIZE CLIENT
// ==========================================

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_API_KEY;

if (!API_KEY) {
  console.error("⚠️ CRITICAL: Missing API KEY. Analysis will fail.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

const generateSmartContent = async (prompt: string) => {
  try {
    // Attempt 1: Fast & Cost Effective
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    return await model.generateContent(prompt);
  } catch (error: any) {
    console.warn("⚠️ Primary model failed. Switching to fallback...");
    // Attempt 2: Fallback (Standard Pro)
    const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
    return await fallbackModel.generateContent(prompt);
  }
};

// ==========================================
// 2. ROBUST YOUTUBE ANALYSIS (LOGIC EXPLAINED ABOVE)
// ==========================================

export const getYouTubeID = (url: string) => {
  if (!url) return null;
  // Robust Regex for Shorts, Live, V, Embed, and standard Watch links
  const regex = /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// --- HELPER: THE FALLBACK SCRAPER ---
const fetchVideoTitle = async (videoId: string): Promise<{ title: string; author: string }> => {
  const safeUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  // STRATEGY A: Try NoEmbed (Fastest, cleanest)
  try {
    const response = await fetch(`https://noembed.com/embed?url=${safeUrl}`);
    const data = await response.json();
    if (data.title) return { title: data.title, author: data.author_name };
  } catch (e) {
    console.warn("Strategy A (NoEmbed) failed. Trying Strategy B...");
  }

  // STRATEGY B: CORS Proxy Scrape (Works even if Embed is Disabled)
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(safeUrl)}`;
    const response = await fetch(proxyUrl);
    const data = await response.json();
    
    if (data.contents) {
      const html = data.contents;
      // Extract title tag directly from HTML: <title>Video Title - YouTube</title>
      const titleMatch = html.match(/<title>(.*?) - YouTube<\/title>/);
      if (titleMatch && titleMatch[1]) {
        return { title: titleMatch[1], author: "YouTube Creator" };
      }
    }
  } catch (e) {
    console.error("Strategy B (Scrape) failed.", e);
  }

  throw new Error("Could not retrieve video title. Video might be private.");
};

export const analyzeLectureVideo = async (inputUrl: string) => {
  try {
    console.log("🔍 [1/4] Starting Analysis:", inputUrl);

    // 1. Extract ID
    const videoId = getYouTubeID(inputUrl);
    if (!videoId) throw new Error("Invalid YouTube URL");

    // 2. Get Title (Using Double-Strategy)
    const { title, author } = await fetchVideoTitle(videoId);
    console.log("✅ [2/4] Metadata Found:", title);

    // 3. AI Analysis
    const prompt = `
      CONTEXT:
      Video Title: "${title}"
      Channel: "${author}"

      TASK:
      Act as an "Industrial Curriculum Engineer". Convert this video content into a job-ready skill profile.
      
      1. INDUSTRIAL TITLE: Rename "${title}" to sound like a corporate workshop.
      2. SUMMARY: Write a 2-sentence executive summary.
      3. CONCEPTS: List 3 academic concepts.
      4. RECOVERY POINTS: List 3 actionable industry skills derived from this topic.

      CRITICAL RULE:
      - Do NOT hallucinate. Based strictly on the title "${title}".

      RETURN JSON ONLY:
      {
        "industrialTitle": "...",
        "summary": "...",
        "concepts": ["...", "...", "..."],
        "recoveryPoints": ["...", "...", "..."]
      }
    `;

    const result = await generateSmartContent(prompt);
    const text = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    
    console.log("✅ [4/4] AI Analysis Complete");
    return JSON.parse(text);

  } catch (error: any) {
    console.error("❌ Analysis Failed:", error.message);
    return {
      industrialTitle: "Analysis Unavailable",
      summary: "We couldn't read the video title. It might be Private or Age-Restricted.",
      recoveryPoints: ["Check URL", "Try a different video"],
      concepts: ["N/A"]
    };
  }
};

// ==========================================
// 3. QUIZZES & LEADERBOARD (FIXED TABLE NAME)
// ==========================================

export const generateTopicQuiz = async (topic: string) => {
  try {
    const prompt = `Create a 5-question multiple choice quiz on "${topic}". JSON format: [{question, options[], correctAnswer(int)}]`;
    const result = await generateSmartContent(prompt);
    const cleanJson = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) { return []; }
};

export const saveQuizResult = async (username: string, topic: string, score: number, total: number) => {
  // Fixed: Uses 'quizzes' table and 'username' column
  const { error } = await supabase.from('quizzes').insert([{ 
    username: username, 
    topic: topic, 
    score: score, 
    total_questions: total,
    user_major: 'General Engineering'
  }]);
  if (error) console.error("Supabase Error:", error);
  return !error;
};

export const getLeaderboard = async () => {
  try {
    // Fixed: Uses 'quizzes' table
    const { data } = await supabase.from('quizzes').select('username, topic, score').order('score', { ascending: false }).limit(5);
    return data ? data.map((entry, index) => ({
      name: entry.username || `Student ${index + 1}`,
      score: entry.score * 50,
      topic: entry.topic
    })) : [];
  } catch (e) { return []; }
};

// ==========================================
// 4. CAREER & RECOVERY PATH
// ==========================================

export const getRecoveryPath = async (goal: string) => {
  try {
    const prompt = `
      Create a 4-step recovery path for: "${goal}".
      Steps must have: title, description, and a specific YouTube search query.
      JSON Only: { "goal": "${goal}", "steps": [{ "title": "...", "description": "...", "searchQuery": "..." }] }
    `;
    const result = await generateSmartContent(prompt);
    const data = JSON.parse(result.response.text().replace(/```json/g, '').replace(/```/g, '').trim());
    
    const stepsWithLinks = data.steps.map((step: any) => ({
      ...step,
      youtubeLink: `https://www.youtube.com/results?search_query=${encodeURIComponent(step.searchQuery)}`
    }));

    return { ...data, steps: stepsWithLinks };
  } catch (e) { return null; }
};

export const findRecoveryVideos = async (skill: string) => {
  try {
    const prompt = `Suggest a specific, real high-quality YouTube video title and search query for learning "${skill}". Return JSON: { title, rationale }`;
    const result = await generateSmartContent(prompt);
    const data = JSON.parse(result.response.text().replace(/```json/g, '').replace(/```/g, '').trim());
    
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
    const prompt = `User Goal: "${goal}". Courses: ${JSON.stringify(courses.map(c => ({id: c.id, title: c.title})))}. Select best. Return JSON array: [{ "id": "...", "reason": "..." }]`;
    const result = await generateSmartContent(prompt);
    return JSON.parse(result.response.text().replace(/```json/g, '').replace(/```/g, '').trim());
  } catch (e) { return []; }
};

export const getCareerAssessment = async (skills: string[], major: string) => {
  try {
    const prompt = `Assess a ${major} student with skills: ${skills.join(', ')}. Return 3 paragraphs: Roles, Missing Skills, Motivation.`;
    const result = await generateSmartContent(prompt);
    return result.response.text();
  } catch (e) { return "Assessment unavailable."; }
};