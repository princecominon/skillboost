/// <reference types="vite/client" />
import { GoogleGenAI, Type } from "@google/genai";
import { Course } from "../types";

// FIXED: Added reference above to fix 'import.meta' error
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY || ""; 

const ai = new GoogleGenAI({ apiKey: apiKey });

/**
 * Utility to extract Video ID from various YouTube URL formats
 */
export const getYouTubeID = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const generateTopicQuiz = async (topic: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite-preview-02-05", 
      contents: `Generate a challenging 5-question multiple choice quiz for a college student on the topic: "${topic}". 
      The questions must bridge academic theory and industry standards. 
      Each question must have exactly 4 options.
      Return the response in a strict JSON array format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY, // FIXED: Changed SchemaType back to Type
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                minItems: 4,
                maxItems: 4
              },
              correctAnswer: { type: Type.INTEGER, description: "The index (0-3) of the correct answer." }
            },
            required: ['question', 'options', 'correctAnswer']
          }
        }
      }
    });
    // FIXED: Removed () from .text
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Quiz Generation Error:", error);
    return null;
  }
};

export const getRecoveryPath = async (concept: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite-preview-02-05",
      contents: `Generate a 3-step 'Instant Recovery Path' for a college student struggling with: "${concept}". 
      Focus on bridging academic theory to industry application. 
      Format: JSON with concept name and 3 steps (title, description, resourceType).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT, // FIXED: Changed SchemaType back to Type
          properties: {
            concept: { type: Type.STRING },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  resourceType: { type: Type.STRING, enum: ['video', 'article', 'quiz'] }
                },
                required: ['title', 'description', 'resourceType']
              }
            }
          },
          required: ['concept', 'steps']
        }
      }
    });
    // FIXED: Removed () from .text
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};

export const getCareerAssessment = async (skills: string[], major: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite-preview-02-05",
      contents: `Based on a ${major} student with these skills: [${skills.join(', ')}], 
      provide a short 3-paragraph career assessment profile. Include: 
      1. Top 3 roles they should aim for.
      2. Missing high-value skills they should learn in their next 30-120 min gaps.
      3. A motivational 'Industry Gap' summary.`,
    });
    // FIXED: Removed () from .text
    return response.text;
  } catch (error) {
    console.error("Gemini Assessment Error:", error);
    return "Assessment service currently unavailable. Please check your internet connection.";
  }
};

export const recommendCourses = async (goal: string, courses: Course[]) => {
  try {
    const catalogBrief = courses.map(c => ({ id: c.id, title: c.title, skills: c.skills }));
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite-preview-02-05",
      contents: `User Career Ambition: "${goal}"
      Available Course Modules: ${JSON.stringify(catalogBrief)}
      
      Task: Create a "Recovery Pathway". This is a sequential plan to fix the gap between a student's current state and their ambitious career goal.
      Return a JSON array of objects in recommended order. 
      Each object must have "id" (from the modules) and "reason" (explaining how this specific module recovers a missing industry skill required for the goal).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY, // FIXED: Changed SchemaType back to Type
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ['id', 'reason']
          }
        }
      }
    });
    // FIXED: Removed () from .text
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Gemini Recommendation Error:", error);
    return [];
  }
};

export const findRecoveryVideos = async (skill: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite-preview-02-05",
      contents: `Search for a specific, high-impact YouTube tutorial for the industry skill: "${skill}". 
      You must find a real YouTube link.
      In your response, please provide exactly:
      Title: [Video Title]
      Rationale: [Why this specific video bridges the industry gap for students]`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    // FIXED: Removed () from .text
    const text = response.text || '';
    
    const urlMatch = text.match(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s]+/);
    const titleMatch = text.match(/Title.*?\s*:\s*(.*)/i);
    const rationaleMatch = text.match(/Rationale.*?\s*:\s*(.*)/i);

    return {
      title: titleMatch ? titleMatch[1].trim() : `Industrial Focus: ${skill}`,
      url: urlMatch ? urlMatch[0] : null,
      rationale: rationaleMatch ? rationaleMatch[1].trim() : "This curated resource provides the necessary professional context.",
      channel: "YouTube"
    };
  } catch (error) {
    console.error("Gemini Video Search Error:", error);
    return null;
  }
};

export const analyzeLectureVideo = async (url: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite-preview-02-05",
      contents: `Search for this YouTube video and analyze its metadata/content: ${url}.
      Identify core academic concepts and provide:
      1. A professional 'Industrial Title'.
      2. 3 Industry-standard 'Recovery Points' (practical gaps).
      3. A summary.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    // FIXED: Removed () from .text
    const text = response.text || '';
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    
    return {
      industrialTitle: lines.find(l => l.includes("Title"))?.replace(/.*Title:\s*/, "") || "Industrialized Lecture",
      summary: text.substring(0, 300).trim() + "...",
      recoveryPoints: ["Advanced Implementation", "Production Reliability", "Scalability Patterns"],
      concepts: ["Academic Fundamentals"]
    };
  } catch (error) {
    console.error("Lecture Analysis Error:", error);
    return null;
  }
};