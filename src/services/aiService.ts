import { GoogleGenAI } from "@google/genai";

export const aiService = {
  generateTourDescription: async (location: string, title: string) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key de Gemini no encontrada en el entorno.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Genera una descripción cautivadora y detallada para un tour turístico llamado "${title}" ubicado en "${location}". 
        Incluye detalles sobre qué esperar, la belleza natural o cultural del lugar y por qué es una experiencia imperdible. 
        La descripción debe estar en español y tener un tono profesional pero entusiasta. 
        No incluyas introducciones como "Aquí tienes la descripción", solo el texto descriptivo.`,
      });

      if (!response.text) {
        throw new Error("La respuesta de la IA está vacía.");
      }

      return response.text;
    } catch (error) {
      console.error("Error generating AI description:", error);
      throw error;
    }
  }
};
