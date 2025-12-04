import { GoogleGenAI, Type } from "@google/genai";
import { Scene, AspectRatio, ImageStyle } from "../types";

// Initialize Gemini Client
// NOTE: We recreate the client in functions to ensure we always grab the latest key if needed, 
// though standard practice is singleton. Given the instructions, we use process.env.API_KEY.
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes the raw script and breaks it down into scenes with visual prompts.
 */
export const analyzeScript = async (scriptText: string): Promise<Omit<Scene, 'id' | 'status'>[]> => {
  const ai = getAiClient();
  
  const systemInstruction = `
    You are an expert storyboard artist and director. 
    Your task is to take a raw script and break it down into distinct visual scenes.
    
    Rules:
    1. Detect scene breaks based on new lines, paragraph breaks, or keywords like "Scene", "Shot", "Clip".
    2. For each scene, preserve the "original_text".
    3. Generate a "visual_prompt" for an AI image generator (like Midjourney or Gemini). 
       The prompt must be highly descriptive, including lighting, camera angle, mood, environment, and action.
       Do not use copyrighted character names; describe their appearance instead.
       Keep prompts concise but potent (around 40-60 words).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: scriptText,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              original_text: { type: Type.STRING },
              visual_prompt: { type: Type.STRING },
            },
            required: ["original_text", "visual_prompt"],
          },
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    const parsed = JSON.parse(jsonText);
    
    // Map to our internal structure (converting snake_case to camelCase if needed)
    return parsed.map((item: any) => ({
      originalText: item.original_text,
      visualPrompt: item.visual_prompt,
    }));

  } catch (error) {
    console.error("Error analyzing script:", error);
    throw error;
  }
};

/**
 * Generates an image for a specific prompt.
 */
export const generateSceneImage = async (
  prompt: string, 
  style: ImageStyle, 
  ratio: AspectRatio
): Promise<string> => {
  const ai = getAiClient();

  // Enhance prompt with style
  const finalPrompt = `${prompt}, ${style} style, high resolution, detailed, masterpiece`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: finalPrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: ratio
        }
      }
    });

    // Extract base64 image
    let base64Image = null;
    
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
        const parts = candidates[0].content.parts;
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                base64Image = part.inlineData.data;
                break;
            }
        }
    }

    if (!base64Image) {
      throw new Error("No image data found in response");
    }

    return `data:image/png;base64,${base64Image}`;

  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};