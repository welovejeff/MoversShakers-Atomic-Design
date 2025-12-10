/**
 * Gemini Service - AI operations via Cloud Functions or direct API
 * 
 * This service provides a unified interface for AI operations.
 * In development: Can use direct Gemini API
 * In production: Should use Cloud Functions for security
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig';
import { Contact, PrioritizationResult, ResearchResult, Priority } from '../types';

// Flag to toggle between direct API and Cloud Functions
// Set to true when Firebase is fully configured
const USE_CLOUD_FUNCTIONS = import.meta.env.VITE_USE_CLOUD_FUNCTIONS === 'true';

// Direct API imports (fallback for development)
import { GoogleGenAI, Type, Schema } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });
const MODEL_ID = "gemini-3-pro-preview";

/**
 * Batch prioritizes contacts based on user-defined criteria.
 */
export const prioritizeContacts = async (
  contacts: Contact[],
  criteria: string
): Promise<PrioritizationResult[]> => {
  if (USE_CLOUD_FUNCTIONS) {
    const prioritization = httpsCallable(functions, 'prioritization');
    const result = await prioritization({
      contacts: contacts.map(c => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        company: c.company,
        position: c.position,
        category: c.category,
        location: c.location,
        familiarity: c.familiarity,
      })),
      criteria,
    });
    return (result.data as any).results;
  }

  // Direct API fallback
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
      model: MODEL_ID,
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
  if (USE_CLOUD_FUNCTIONS) {
    const research = httpsCallable(functions, 'research');
    const result = await research({
      contactId: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      company: contact.company,
      position: contact.position,
      category: contact.category,
      location: contact.location,
    });
    const data = result.data as any;
    return {
      notes: data.notes,
      sources: data.sources,
      citations: data.citations,
    };
  }

  // Direct API fallback
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
      model: MODEL_ID,
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

    const uniqueSources = Array.from(new Map(sources.map((item: any) => [item.uri, item])).values()) as Array<{ uri: string, title: string }>;

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
  if (USE_CLOUD_FUNCTIONS) {
    const outreach = httpsCallable(functions, 'outreach');
    const result = await outreach({
      contactId: contact.id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      company: contact.company,
      position: contact.position,
      category: contact.category,
      location: contact.location,
      familiarity: contact.familiarity,
      userDirectives,
      existingResearchNotes: researchNotes,
    });
    return (result.data as any).draftMessage;
  }

  // Direct API fallback
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
      model: MODEL_ID,
      contents: prompt
    });
    return response.text || "";
  } catch (error) {
    console.error("Drafting failed:", error);
    throw error;
  }
};