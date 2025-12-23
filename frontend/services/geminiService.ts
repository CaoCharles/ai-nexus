import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

try {
  // In a real app, ensure process.env.API_KEY is available.
  // We use a try-catch to prevent app crash if key is missing in this demo environment.
  if (process.env.API_KEY) {
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
} catch (error) {
  console.error("Failed to initialize Gemini Client", error);
}

export const summarizeArticle = async (text: string): Promise<string> => {
  if (!genAI) {
    return "Gemini API Key is missing. Please configure the environment variable to use AI features.";
  }

  try {
    const response = await genAI.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Summarize the following news article into 3 concise bullet points. Focus on the most impactful details.\n\nArticle:\n${text}`,
      config: {
        systemInstruction: "You are a helpful news editor assistant. Keep summaries objective, concise, and easy to read.",
      }
    });
    
    return response.text || "No summary generated.";
  } catch (error) {
    console.error("Error summarizing article:", error);
    return "Failed to generate summary. Please try again later.";
  }
};