import { GoogleGenAI } from "@google/genai";
import { Book } from "../types";

const initGenAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const askLibrarian = async (query: string, inventory: Book[]): Promise<string> => {
  const ai = initGenAI();
  if (!ai) return "Error: API Key is missing. Please check your environment configuration.";

  // Create a context-aware prompt with the current database state
  const inventoryContext = inventory.map(b => 
    `- [${b.BookID}] "${b.Title}" by ${b.Author} (${b.Category}, ${b.PublishYear}). Status: ${b.Status}`
  ).join('\n');

  const systemInstruction = `
    You are a helpful and intelligent Smart Library Assistant.
    You have access to the current library catalog provided below.
    Answer user queries based ONLY on this catalog.
    If a user asks for a recommendation, suggest books from the list.
    If a user asks about a book's status, check if it is Available or Borrowed.
    Keep answers concise and professional.
    
    Current Catalog:
    ${inventoryContext}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || "I couldn't find an answer to that.";
  } catch (error) {
    console.error("AI Error:", error);
    return "I am currently having trouble connecting to the knowledge base.";
  }
};