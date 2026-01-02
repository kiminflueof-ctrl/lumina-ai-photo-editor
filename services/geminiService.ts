
import { GoogleGenAI } from "@google/genai";
import { ImageData } from "../types";

export const processImage = async (
  sourceImage: ImageData,
  prompt: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: sourceImage.base64.split(',')[1],
              mimeType: sourceImage.mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error('No content returned from AI');
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error('No image part found in AI response');
  } catch (error) {
    console.error('Error in Gemini Service:', error);
    throw error;
  }
};
