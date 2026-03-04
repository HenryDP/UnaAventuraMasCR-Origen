import { GoogleGenAI } from "@google/genai";

// Inicialización con la API Key de Gemini adaptada para VITE
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const aiService = {
  generateTourDescription: async (location: string, title: string) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Genera una descripción cautivadora y detallada para un tour turístico llamado "${title}" ubicado en "${location}". 
        Incluye detalles sobre qué esperar, la belleza natural o cultural del lugar y por qué es una experiencia imperdible. 
        La descripción debe estar en español y tener un tono profesional pero entusiasta.`,
        config: {
          tools: [{ googleSearch: {} }], // Usa Google Search para obtener datos reales
        },
      });

      return response.text;
    } catch (error) {
      console.error("Error generating AI description:", error);
      throw new Error("No se pudo generar la descripción con IA.");
    }
  }
};