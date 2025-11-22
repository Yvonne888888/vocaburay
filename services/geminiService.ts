import { GoogleGenAI, Type } from "@google/genai";
import { AICollocationResponse } from "../types";

// Initialize Gemini API Client
// NOTE: process.env.API_KEY is injected by Vite during build from your .env file or system env.
const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const MODEL_FAST = 'gemini-2.5-flash';

export const generateCollocations = async (word: string): Promise<string[]> => {
  if (!apiKey) { 
    console.warn("API Key not found"); 
    return []; 
  }
  try {
    const prompt = `Generate 3 common, natural English collocations for the word or phrase: "${word}". Return ONLY the raw strings in a JSON array.`;
    
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            collocations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || '{"collocations": []}') as AICollocationResponse;
    return json.collocations;
  } catch (error) {
    console.error("Gemini API Error (Collocations):", error);
    return [];
  }
};

export const generateContext = async (word: string): Promise<string> => {
  if (!apiKey) return "";
  try {
    // Requesting 2 sentences based on most common usage
    const prompt = `Generate TWO short, authentic English context sentences using the word or phrase: "${word}". 
    Focus on the most common usage/meaning of the word. 
    The sentences should sound like they are from a modern podcast or casual conversation. 
    Return them as a single string separated by a space.`;
    
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini API Error (Context):", error);
    return "";
  }
};

export const generateMeaning = async (word: string): Promise<string> => {
  if (!apiKey) return "";
  try {
    // Specifically requesting IPA and Chinese
    const prompt = `Provide the IPA phonetic transcription and the 1-2 most common CHINESE meanings for the word: "${word}".
    Format the output EXACTLY like this: "/IPA/ Chinese Meaning 1; Chinese Meaning 2".
    Example output: "/həˈləʊ/ 你好; 喂".
    Keep it concise. Do not include English definitions.`;
    
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini API Error (Meaning):", error);
    return "";
  }
};