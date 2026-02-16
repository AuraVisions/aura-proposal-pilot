
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePhaseContent = async (phaseTitle: string, context: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert Digital Transformation consultant. 
      Generate professional content for a proposal phase titled "${phaseTitle}". 
      Context provided: "${context}". 
      Respond in a professional, structured, and enterprise-grade manner. 
      Format the response as a clear, concise block of text suitable for an agency proposal.`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Content Generation Error:", error);
    return "Error generating content. Please try manual entry.";
  }
};
