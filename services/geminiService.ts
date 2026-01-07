
import { GoogleGenAI, Type } from "@google/genai";
import { ClothingItem, Category } from "../types";

export interface StylingPrefs {
  occasion: string;
  style: string;
  location: string;
  weather: string;
  season: string;
  colorTone: string;
}

export const getFashionAdvice = async (items: ClothingItem[], prefs: StylingPrefs): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const wardrobeDescription = items.map(item => 
    `- ${item.name} (${item.category}, Color: ${item.color})`
  ).join('\n');

  const prompt = `
    You are a high-end personal fashion stylist. 
    User's Wardrobe:
    ${wardrobeDescription}

    Task: Suggest 3 unique outfits based on these specific constraints:
    - Occasion: ${prefs.occasion || 'General'}
    - Preferred Style: ${prefs.style}
    - Location: ${prefs.location}
    - Weather: ${prefs.weather}
    - Season: ${prefs.season}
    - Color Tone: ${prefs.colorTone}

    Requirements:
    1. Use ONLY the items available in the wardrobe description. 
    2. Ensure the outfits are practical for the specified weather and season.
    3. Respect the chosen style and color tone.
    4. For each outfit, provide a title, a list of item names used, and a professional styling tip.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            outfits: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  itemsUsed: { 
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  stylingTip: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["title", "itemsUsed", "stylingTip"]
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
