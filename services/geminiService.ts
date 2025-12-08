import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Contact, PrioritizationResult, ResearchResult, Priority } from "../types";

// Initialize the client. API_KEY is managed via environment variable injection in this environment.
// Note: In a real production app, ensure backend proxy or secure handling.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Batch prioritizes contacts based on user-defined criteria.
 */
export const prioritizeContacts = async (
  contacts: Contact[],
  criteria: string
): Promise<PrioritizationResult[]> => {
  const modelId = "gemini-2.5-flash"; // Fast and efficient for logic

  // We only send relevant fields to save tokens and reduce noise
  const simplifiedContacts = contacts.map(c => ({
    id: c.id,
    name: `${c.firstName} ${c.lastName}`,
    company: c.company,
    position: c.position,
    category: c.category,
    location: c.location,
    familiarity: c.familiarity
  }));

  const prompt = `
    You are an expert Sales Development Representative. 
    Analyze the following list of contacts and assign a priority (High, Medium, Low, Ignore) to each based on the user's strategy.
    
    USER STRATEGY: "${criteria}"

    Analyze the company size (implied), title relevance, and location if mentioned in the strategy.
    Use the 'category' field (e.g., Beauty, Tech) to align with industry-specific goals if relevant.
    Return a JSON array where each object contains the contact 'id', 'priority', and a short 'reasoning'.
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        priority: { 
            type: Type.STRING, 
            enum: [Priority.High, Priority.Medium, Priority.Low, Priority.Ignore] 
        },
        reasoning: { type: Type.STRING }
      },
      required: ["id", "priority", "reasoning"]
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: JSON.stringify(simplifiedContacts) + "\n\n" + prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.2
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as PrioritizationResult[];
    }
    return [];
  } catch (error) {
    console.error("Prioritization failed:", error);
    throw error;
  }
};

/**
 * Performs deep research on a specific contact using Google Search grounding.
 */
export const researchContact = async (contact: Contact): Promise<ResearchResult> => {
  // We use 2.5 flash as it supports search and is fast.
  const modelId = "gemini-2.5-flash"; 

  const prompt = `
    Research the following individual and their company for a sales outreach context.
    
    Person: ${contact.firstName} ${contact.lastName}
    Role: ${contact.position}
    Company: ${contact.company}
    Industry Category: ${contact.category}
    Location: ${contact.location}

    Find:
    1. Recent news about the company (last 6 months).
    2. Any public podcasts, articles, or posts by the individual (if notable).
    3. Verify if the company is growing or facing challenges.
    
    Summarize the findings in bullet points suitable for personalizing a LinkedIn message.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.1
      }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
      .map((chunk: any) => ({ uri: chunk.web.uri, title: chunk.web.title }));

    // Remove duplicates based on URI
    const uniqueSources = Array.from(new Map(sources.map((item: any) => [item.uri, item])).values()) as Array<{uri: string, title: string}>;

    return {
      notes: response.text || "No research gathered.",
      sources: uniqueSources
    };

  } catch (error) {
    console.error("Research failed:", error);
    throw error;
  }
};

/**
 * Drafts a LinkedIn message based on contact info and research notes.
 */
export const draftMessage = async (
  contact: Contact, 
  researchNotes: string,
  userDirectives: string
): Promise<string> => {
  const modelId = "gemini-2.5-flash";

  const prompt = `
    Draft a personalized, professional, and concise LinkedIn connection message (max 300 chars if possible, but up to 100 words is okay if connection request is not the goal) for this prospect.
    
    PROSPECT: ${contact.firstName} ${contact.lastName}, ${contact.position} at ${contact.company}.
    CATEGORY: ${contact.category}
    CONTEXT/RESEARCH: ${researchNotes}
    USER DIRECTIVES: ${userDirectives}
    
    The tone should be: ${contact.familiarity === 'Familiar' ? "Warm and reconnecting" : "Professional, curious, and value-add"}.
    Avoid salesy jargon. Focus on relevance.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt
    });
    return response.text || "";
  } catch (error) {
    console.error("Drafting failed:", error);
    throw error;
  }
};