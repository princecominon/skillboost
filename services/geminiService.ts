/// <reference types="vite/client" />
import { Course } from "../types";

// --- HELPER: Call your Vercel Backend ---
async function callBackend(payload: any) {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Backend Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Returns { text: "..." }
  } catch (error) {
    console.error("AI Service Error:", error);
    return { text: null };
  }
}

/**
 * Utility to extract Video ID from various YouTube URL formats
 */
export const getYouTubeID = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// --- UPDATED FUNCTIONS ---

export const generateTopicQuiz = async (topic: string) => {
  // We send the "config" and "prompt" to the backend now
  const response = await callBackend({
    model: "gemini-3-flash-preview",
    contents: `Generate a challenging 5-question multiple choice quiz for a college student on the topic: "${topic}". 
      The questions must bridge academic theory and industry standards. 
      Each question must have exactly 4 options.
      Return the response in a strict JSON array format.`,
    config: {
      responseMimeType: "application/json",
      // Note: We send the schema structure as a plain object to the backend
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            question: { type: "STRING" },
            options: { 
              type: "ARRAY", 
              items: { type: "STRING" },
              minItems: 4,
              maxItems: 4
            },
            correctAnswer: { type: "INTEGER", description: "The index (0-3) of the correct answer." }
          },
          required: ['question', 'options', 'correctAnswer']
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Quiz Parse Error", e);
    return null;
  }
};

export const getRecoveryPath = async (concept: string) => {
  const response = await callBackend({
    model: "gemini-3-flash-preview",
    contents: `Generate a 3-step 'Instant Recovery Path' for a college student struggling with: "${concept}". 
      Focus on bridging academic theory to industry application. 
      Format: JSON with concept name and 3 steps (title, description, resourceType).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          concept: { type: "STRING" },
          steps: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                description: { type: "STRING" },
                resourceType: { type: "STRING", enum: ['video', 'article', 'quiz'] }
              },
              required: ['title', 'description', 'resourceType']
            }
          }
        },
        required: ['concept', 'steps']
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return null;
  }
};

export const getCareerAssessment = async (skills: string[], major: string) => {
  const response = await callBackend({
    model: "gemini-3-flash-preview",
    contents: `Based on a ${major} student with these skills: [${skills.join(', ')}], 
      provide a short 3-paragraph career assessment profile. Include: 
      1. Top 3 roles they should aim for.
      2. Missing high-value skills they should learn in their next 30-120 min gaps.
      3. A motivational 'Industry Gap' summary.`,
  });

  return response.text || "Assessment unavailable.";
};

export const recommendCourses = async (goal: string, courses: Course[]) => {
  const catalogBrief = courses.map(c => ({ id: c.id, title: c.title, skills: c.skills }));
  
  const response = await callBackend({
    model: "gemini-3-flash-preview",
    contents: `User Career Ambition: "${goal}"
      Available Course Modules: ${JSON.stringify(catalogBrief)}
      Task: Create a "Recovery Pathway". Return a JSON array of objects.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            id: { type: "STRING" },
            reason: { type: "STRING" }
          },
          required: ['id', 'reason']
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return [];
  }
};

export const findRecoveryVideos = async (skill: string) => {
  const response = await callBackend({
    model: "gemini-3-flash-preview",
    contents: `Search for a specific, high-impact YouTube tutorial for the industry skill: "${skill}".`,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });

  const text = response.text || '';
  const urlMatch = text.match(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s]+/);
  const titleMatch = text.match(/Title.*?\s*:\s*(.*)/i);
  const rationaleMatch = text.match(/Rationale.*?\s*:\s*(.*)/i);

  return {
    title: titleMatch ? titleMatch[1].trim() : `Industrial Focus: ${skill}`,
    url: urlMatch ? urlMatch[0] : null,
    rationale: rationaleMatch ? rationaleMatch[1].trim() : "Curated resource.",
    channel: "YouTube"
  };
};

export const analyzeLectureVideo = async (url: string) => {
  const response = await callBackend({
    model: "gemini-3-flash-preview",
    contents: `Search for this YouTube video and analyze its metadata/content: ${url}.`,
    config: {
      tools: [{ googleSearch: {} }],
    }
  });

  const text = response.text || '';
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  
  return {
    industrialTitle: lines.find(l => l.includes("Title"))?.replace(/.*Title:\s*/, "") || "Industrialized Lecture",
    summary: text.substring(0, 300).trim() + "...",
    recoveryPoints: ["Advanced Implementation", "Production Reliability", "Scalability Patterns"],
    concepts: ["Academic Fundamentals"]
  };
};