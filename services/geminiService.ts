
import { GoogleGenAI } from "@google/genai";
import { AISearchResult } from "../types";

const LOCAL_STORAGE_KEY = 'vocabflow_gemini_key';

export const getApiKey = (): string | null => {
  // 1. Check Local Storage (User entered in Settings)
  const localKey = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (localKey) return localKey;

  // 2. Check Environment Variable (Build time)
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    // @ts-ignore
    return process.env.API_KEY;
  }

  return null;
};

export const saveApiKey = (key: string) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, key);
};

export const searchEnglishFromChinese = async (chineseInput: string): Promise<AISearchResult[]> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("MISSING_KEY");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const prompt = `
      You are an English vocabulary assistant. 
      The user wants to express this Chinese concept in English: "${chineseInput}".
      
      Provide 3 best English words, phrases, or idioms that match this meaning.
      Return strictly a JSON array. Do not include markdown formatting (like \`\`\`json).
      
      JSON Format:
      [
        {
          "word": "Word/Phrase",
          "definition": "Simple English definition",
          "context": "A natural example sentence using it"
        }
      ]
    `;

    // Switch to gemini-2.5-flash to avoid "Rpc failed due to xhr error" (Code 6)
    // which often occurs with restricted preview models in browser environments.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: prompt,
    });

    const text = response.text;
    if (!text) return [];

    // Clean potential markdown syntax aggressively
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    try {
      const results: AISearchResult[] = JSON.parse(jsonString);
      return results;
    } catch (parseError) {
      console.error("JSON Parse failed:", text);
      throw new Error("Invalid AI response format");
    }

  } catch (error) {
    console.error("Gemini Search Error:", error);
    // Propagate error so UI knows to show error state
    throw error;
  }
};

/**
 * Generates definition and context for a specific English word using AI.
 */
export const generateWordDetails = async (word: string): Promise<{ definition: string; context: string } | null> => {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      For the English word/phrase: "${word}".
      1. Provide a concise, simple English definition.
      2. Provide a natural, modern context sentence (like from a podcast or conversation).
      
      Return strictly JSON:
      {
        "definition": "...",
        "context": "..."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Keep flash for speed on simple generation tasks
      contents: prompt,
    });

    const text = response.text;
    if (!text) return null;

    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Gemini Details Error:", error);
    return null;
  }
};
