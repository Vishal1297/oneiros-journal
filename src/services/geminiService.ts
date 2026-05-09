import { GoogleGenAI, Type } from "@google/genai";

// Support both AI Studio's process.env and Vite's import.meta.env
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '');

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export interface DreamAnalysis {
  emotionalTheme: string;
  surrealPrompt: string;
  interpretation: string;
  symbols: string[];
}

export const geminiService = {
  async transcribeAudio(base64Audio: string, mimeType: string): Promise<string> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            data: base64Audio,
            mimeType: mimeType,
          },
        },
        {
          text: "Transcribe this dream narration exactly as spoken. If there are emotional nuances described, capture them. Return ONLY the transcription text.",
        },
      ],
    });
    return response.text || "";
  },

  async analyzeDream(transcription: string): Promise<DreamAnalysis> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: transcription,
      config: {
        systemInstruction: `You are an expert dream analyst specializing in Jungian archetypes and depth psychology. 
        Your task is to analyze the provided dream transcription.
        
        1. Identify the core emotional theme.
        2. Create a highly detailed, descriptive prompt for a surrealist digital painting that represents this dream's essence. The prompt should be in the style of Salvador Dalí or René Magritte.
        3. Provide a structured psychological interpretation using Jungian archetypes (e.g., The Shadow, The Anima/Animus, The Wise Old Man).
        4. List key symbols appeared in the dream.
        
        Return the result in JSON format.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            emotionalTheme: { type: Type.STRING },
            surrealPrompt: { type: Type.STRING },
            interpretation: { type: Type.STRING, description: "Markdown interpretation of the dream." },
            symbols: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
          },
          required: ["emotionalTheme", "surrealPrompt", "interpretation", "symbols"],
        },
      },
    });

    const json = JSON.parse(response.text || "{}");
    return json as DreamAnalysis;
  },

  async generateDreamImage(surrealPrompt: string): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [
            {
              text: `Generate a surrealist digital painting representing the following dream theme: ${surrealPrompt}. Use a professional digital art style, high resolution, vivid but dreamlike colors, reminiscent of Salvador Dalí or René Magritte. Ensure it is a complete, high-quality image.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1",
          },
        },
      });

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error("No candidates returned from image generation model");
      }

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      
      console.error("Image generation partial response:", JSON.stringify(response));
      throw new Error("Response did not contain image data");
    } catch (err) {
      console.error("Image generation error details:", err);
      throw err;
    }
  },

  async chatAboutDream(
    dreamText: string, 
    interpretation: string, 
    history: { role: "user" | "model"; text: string }[],
    newMessage: string
  ): Promise<string> {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are a dream guide. You are discussing a specific dream with the user. 
        Dream Content: ${dreamText}
        Initial Interpretation: ${interpretation}
        
        Answer their questions about specific symbols, emotions, or themes using a psychological perspective. Keep the tone empathetic and inquisitive.`,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      })),
    });

    const result = await chat.sendMessage({
      message: newMessage
    });
    
    return result.text || "";
  }
};
