/**
 * CRM Outreach Agent - Genkit Cloud Functions
 * 
 * Main entry point for all Genkit flows and Firebase Functions.
 * Uses Gemini 2.0 Flash for AI capabilities.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Define API key as a Firebase secret
const geminiApiKey = defineSecret('GOOGLE_GENAI_API_KEY');

// Initialize Firebase Admin (only once)
if (getApps().length === 0) {
    initializeApp();
}
const db = getFirestore();

// Initialize Genkit with Google AI
const ai = genkit({
    plugins: [googleAI()],
});

// Model configuration
const GEMINI_MODEL = 'googleai/gemini-2.0-flash';

// =============================================================================
// RESEARCH FUNCTION
// =============================================================================

export const research = onCall(
    { secrets: [geminiApiKey] },
    async (request) => {
        const { contactId, firstName, lastName, company, position, category, location, forceRefresh } = request.data;

        if (!contactId || !firstName || !lastName || !company) {
            throw new HttpsError('invalid-argument', 'Missing required fields');
        }

        // Check cache first (unless force refresh)
        if (!forceRefresh) {
            const cachedDoc = await db.collection('research').doc(contactId).get();
            if (cachedDoc.exists) {
                const data = cachedDoc.data();
                if (data && data.expiresAt && data.expiresAt.toMillis() > Date.now()) {
                    return {
                        notes: data.notes,
                        sources: data.sources || [],
                        cached: true,
                    };
                }
            }
        }

        // Perform research using Gemini
        const prompt = `
      Research the following individual and their company for a sales outreach context.
      
      Person: ${firstName} ${lastName}
      Role: ${position || 'Unknown'}
      Company: ${company}
      Industry Category: ${category || 'Unknown'}
      Location: ${location || 'Unknown'}

      Find:
      1. Recent news about the company (last 6 months).
      2. Any public podcasts, articles, or posts by the individual (if notable).
      3. Verify if the company is growing or facing challenges.
      
      Summarize the findings in bullet points suitable for personalizing a LinkedIn message.
      Be concise but informative. Focus on actionable insights.
    `;

        const response = await ai.generate({
            model: GEMINI_MODEL,
            prompt,
            config: { temperature: 0.1 },
        });

        const result = {
            notes: response.text || 'No research gathered.',
            sources: [] as Array<{ uri: string; title: string }>,
            cached: false,
        };

        // Cache the result (7 days)
        const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
        await db.collection('research').doc(contactId).set({
            contactId,
            notes: result.notes,
            sources: result.sources,
            model: GEMINI_MODEL,
            createdAt: Timestamp.now(),
            expiresAt: Timestamp.fromMillis(Date.now() + CACHE_DURATION_MS),
        });

        return result;
    }
);

// =============================================================================
// OUTREACH FUNCTION  
// =============================================================================

export const outreach = onCall(
    { secrets: [geminiApiKey] },
    async (request) => {
        const {
            firstName,
            lastName,
            company,
            position,
            category,
            familiarity,
            userDirectives,
            researchNotes,
        } = request.data;

        if (!firstName || !lastName || !company) {
            throw new HttpsError('invalid-argument', 'Missing required fields');
        }

        const notes = researchNotes || 'No prior research available.';

        // Generate personalized message
        const tone = familiarity === 'Familiar'
            ? 'Warm and reconnecting - reference past interactions naturally'
            : 'Professional, curious, and value-focused - establish a genuine connection';

        const prompt = `
      Draft a personalized, professional LinkedIn connection message for this prospect.
      
      PROSPECT: ${firstName} ${lastName}, ${position || 'Professional'} at ${company}
      INDUSTRY: ${category || 'Unknown'}
      RELATIONSHIP: ${familiarity || 'New contact'}
      
      RESEARCH CONTEXT:
      ${notes}
      
      ${userDirectives ? `USER DIRECTIVES: ${userDirectives}` : ''}
      
      TONE GUIDANCE: ${tone}
      
      CONSTRAINTS:
      - Keep it concise (max 300 characters for connection request, up to 100 words if InMail)
      - Avoid salesy jargon and generic compliments
      - Reference specific, relevant details from the research
      - End with a soft call-to-action or question
      - Be authentic and human
      
      Generate ONLY the message text, no subject line or explanations.
    `;

        const response = await ai.generate({
            model: GEMINI_MODEL,
            prompt,
            config: { temperature: 0.7 },
        });

        return {
            draftMessage: response.text || '',
            researchNotes: notes,
        };
    }
);

// =============================================================================
// PRIORITIZATION FUNCTION
// =============================================================================

export const prioritization = onCall(
    { secrets: [geminiApiKey] },
    async (request) => {
        const { contacts, criteria } = request.data;

        if (!contacts || !Array.isArray(contacts) || !criteria) {
            throw new HttpsError('invalid-argument', 'Missing contacts array or criteria');
        }

        const simplifiedContacts = contacts.map((c: any) => ({
            id: c.id,
            name: `${c.firstName} ${c.lastName}`,
            company: c.company,
            position: c.position,
            category: c.category,
            location: c.location,
            familiarity: c.familiarity,
        }));

        const prompt = `
      You are an expert Sales Development Representative.
      Analyze the following list of contacts and assign a priority (High, Medium, Low, Ignore) to each based on the user's strategy.
      
      USER STRATEGY: "${criteria}"

      Guidelines:
      - HIGH: Decision makers at target companies, strong alignment with strategy
      - MEDIUM: Relevant contacts worth pursuing, moderate alignment
      - LOW: Potentially useful but not a priority
      - IGNORE: Not relevant to the strategy, wrong industry/role
      
      CONTACTS:
      ${JSON.stringify(simplifiedContacts, null, 2)}
      
      Respond with ONLY a JSON object containing a "results" array where each item has:
      - "id": the contact id
      - "priority": one of "High", "Medium", "Low", "Ignore"
      - "reasoning": a brief 1-2 sentence explanation
    `;

        const response = await ai.generate({
            model: GEMINI_MODEL,
            prompt,
            config: { temperature: 0.2 },
            output: {
                format: 'json',
                schema: z.object({
                    results: z.array(z.object({
                        id: z.string(),
                        priority: z.enum(['High', 'Medium', 'Low', 'Ignore']),
                        reasoning: z.string(),
                    })),
                }),
            },
        });

        return response.output || { results: [] };
    }
);
