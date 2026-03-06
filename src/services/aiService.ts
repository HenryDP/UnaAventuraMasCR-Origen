import { GoogleGenAI } from "@google/genai";

export const aiService = {
  generateTourDescription: async (location: string, title: string) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key de Gemini no encontrada. Por favor, asegúrate de que esté configurada.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{
          parts: [{
            text: `Genera una descripción cautivadora y detallada para un tour turístico llamado "${title}" ubicado en "${location}". 
            Incluye detalles sobre qué esperar, la belleza natural o cultural del lugar y por qué es una experiencia imperdible. 
            La descripción debe estar en español y tener un tono profesional pero entusiasta. 
            No incluyas introducciones como "Aquí tienes la descripción", solo el texto descriptivo.`
          }]
        }],
      });

      if (!response.text) {
        throw new Error("La respuesta de la IA está vacía.");
      }

      return response.text;
    } catch (error) {
      console.error("Error generating AI description:", error);
      throw error;
    }
  },

  editImageWithAI: async (base64Image: string, mimeType: string, prompt: string) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key de Gemini no encontrada.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image.split(',')[1] || base64Image,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }

      throw new Error("No se pudo generar la imagen editada.");
    } catch (error) {
      console.error("Error editing image with AI:", error);
      throw error;
    }
  }
};
