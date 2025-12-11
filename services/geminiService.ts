import { GoogleGenAI, Type } from "@google/genai";
import { Phrase } from "../types";

const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';

// Schema for structured output
const phraseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      jp: { type: Type.STRING, description: "The Japanese phrase" },
      cn: { type: Type.STRING, description: "Traditional Chinese translation" }
    },
    required: ["jp", "cn"]
  }
};

export const generateKeywords = async (keyword: string, count: number = 6): Promise<Phrase[]> => {
  if (!apiKey) return [{ jp: "API Key Missing", cn: "請設定 API Key" }];

  try {
    const prompt = `
      You are a specialized 'Gentleman AI' praise generator.
      Generate ${count} short, enthusiastic, anime-fan-culture style praise phrases based on the keyword: "${keyword}".
      Target audience: Otaku, fans praising artists/vtubers.
      Tone: Enthusiastic, slightly exaggerated, polite but passionate.
      Output pure JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: phraseSchema,
        temperature: 0.8
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Error:", error);
    return [{ jp: "エラー発生", cn: "生成失敗，請稍後再試" }];
  }
};

export const generateReply = async (context: string, count: number = 6): Promise<Phrase[]> => {
  if (!apiKey) return [{ jp: "API Key Missing", cn: "請設定 API Key" }];

  try {
    const prompt = `
      You are a supportive fan.
      The user (an artist or creator) said: "${context}".
      Generate ${count} distinct, warm, and supportive replies in Japanese with Traditional Chinese translations.
      Tone: Encouraging, gentlemanly, fan-boy/fan-girl style.
      Output pure JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: phraseSchema,
        temperature: 0.7
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Error:", error);
    return [{ jp: "エラー発生", cn: "生成失敗，請稍後再試" }];
  }
};

export const rewritePhrases = async (phrases: Phrase[], contextLabel: string): Promise<Phrase[]> => {
  if (!apiKey) return phrases; // Return original if no key

  try {
    const inputPhrases = phrases.map(p => p.jp).join(", ");
    const prompt = `
      Rewrite the following Japanese phrases to be more passionate, 'gentlemanly' (in an anime/otaku cultural sense), and varied.
      Context/Theme: ${contextLabel}.
      Original phrases: ${inputPhrases}.
      Return exactly ${phrases.length} rewritten phrases with their Traditional Chinese translations.
      Output pure JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: phraseSchema,
        temperature: 0.85
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Error:", error);
    return phrases; // Fallback to original
  }
};
