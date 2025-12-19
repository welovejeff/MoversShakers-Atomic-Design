/**
 * CRM Outreach Agent - Genkit Cloud Functions
 * 
 * Main entry point for all Genkit flows and Firebase Functions.
 * Uses Gemini 3 Pro for AI capabilities.
 * Research function uses Google Search grounding for real-time citations.
 */

import { genkit, z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { GoogleGenAI } from '@google/genai';
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

// Initialize Genkit with Google AI (for outreach and prioritization)
const ai = genkit({
    plugins: [googleAI()],
});

// Model configuration
const GEMINI_MODEL = 'googleai/gemini-3-pro-preview';
const DIRECT_MODEL = 'gemini-2.0-flash';

// =============================================================================
// RESEARCH FUNCTION (uses direct SDK for Google Search grounding)
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
                        citations: data.citations || [],
                        cached: true,
                    };
                }
            }
        }

        // Initialize direct Google GenAI SDK (for Google Search grounding)
        const genAI = new GoogleGenAI({ apiKey: geminiApiKey.value() });

        // Perform research using Gemini with Google Search grounding
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

        // Use direct SDK with Google Search grounding enabled
        const response = await genAI.models.generateContent({
            model: DIRECT_MODEL,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                temperature: 0.1
            }
        });

        // Extract grounding sources from the response metadata
        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const groundingChunks = groundingMetadata?.groundingChunks || [];
        const groundingSupports = groundingMetadata?.groundingSupports || [];

        // Parse sources from grounding chunks
        const sources = groundingChunks
            .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
            .map((chunk: any) => ({
                uri: chunk.web.uri,
                title: chunk.web.title,
            }));

        // Deduplicate sources by URI and create index mapping
        const uniqueSources = Array.from(
            new Map(sources.map((s: any) => [s.uri, s])).values()
        ) as Array<{ uri: string; title: string }>;

        // Parse grounding supports for inline citations
        const citations = groundingSupports.map((support: any) => ({
            text: support.segment?.text || '',
            startIndex: support.segment?.startIndex || 0,
            endIndex: support.segment?.endIndex || 0,
            sourceIndices: support.groundingChunkIndices || [],
        }));

        const result = {
            notes: response.text || 'No research gathered.',
            sources: uniqueSources,
            citations: citations,
            cached: false,
        };

        // Cache the result (7 days)
        const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
        await db.collection('research').doc(contactId).set({
            contactId,
            notes: result.notes,
            sources: result.sources,
            citations: result.citations,
            model: DIRECT_MODEL,
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

// =============================================================================
// DEEP RESEARCH FUNCTION (Interactions API)
// =============================================================================

const DEEP_RESEARCH_AGENT = 'deep-research-pro-preview-12-2025';

export const deepResearch = onCall(
    { secrets: [geminiApiKey], timeoutSeconds: 300 },
    async (request) => {
        const { contactId, firstName, lastName, company, position, category, location } = request.data;

        if (!contactId) {
            throw new HttpsError('invalid-argument', 'Missing contactId');
        }

        const client = new GoogleGenAI({ apiKey: geminiApiKey.value() });

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
        `;

        try {
            const interaction = await client.interactions.create({
                agent: DEEP_RESEARCH_AGENT,
                input: prompt,
                background: true
            });

            // Store interaction ID for tracking
            await db.collection('research-jobs').doc(contactId).set({
                interactionId: interaction.id,
                contactId,
                status: 'in_progress',
                startedAt: Timestamp.now(),
                model: DEEP_RESEARCH_AGENT
            });

            return {
                interactionId: interaction.id,
                status: 'in_progress',
                formattedStatus: 'Research started'
            };
        } catch (error: any) {
            console.error("Deep Research Start Failed:", error);
            throw new HttpsError('internal', `Failed to start research: ${error.message}`);
        }
    }
);

export const getResearchStatus = onCall(
    { secrets: [geminiApiKey] },
    async (request) => {
        const { contactId, interactionId } = request.data;

        if (!interactionId) {
            throw new HttpsError('invalid-argument', 'Missing interactionId');
        }

        const client = new GoogleGenAI({ apiKey: geminiApiKey.value() });

        try {
            const result = await client.interactions.get(interactionId);

            let researchResult = null;
            let thinkingLog: string[] = [];

            // Extract thinking/reasoning messages from outputs
            if (result.outputs && result.outputs.length > 0) {
                thinkingLog = result.outputs
                    .filter((o: any) => o.type === 'thinking' || o.role === 'model')
                    .map((o: any) => o.text || o.content || '')
                    .filter((s: string) => s.length > 0);
            }

            if (result.status === 'completed') {
                const output = result.outputs?.[result.outputs.length - 1];
                const researchText = (output as any)?.text || "Research completed but no text returned.";

                // Deep Research typically embeds sources in the text or metadata
                // For now, we initialize sources as empty, to be possibly parsed or extracted if available
                const sources: any[] = [];

                researchResult = {
                    notes: researchText,
                    sources: sources,
                    citations: [],
                    cached: false
                };

                // Cache complete research
                const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
                await db.collection('research').doc(contactId).set({
                    contactId,
                    notes: researchResult.notes,
                    sources: researchResult.sources,
                    model: DEEP_RESEARCH_AGENT,
                    createdAt: Timestamp.now(),
                    expiresAt: Timestamp.fromMillis(Date.now() + CACHE_DURATION_MS),
                });

                // Update job status
                await db.collection('research-jobs').doc(contactId).update({
                    status: 'completed',
                    completedAt: Timestamp.now()
                });
            } else if (result.status === 'failed') {
                await db.collection('research-jobs').doc(contactId).update({
                    status: 'failed',
                    error: (result as any).error?.message || "Unknown error",
                    completedAt: Timestamp.now()
                });
            }

            return {
                status: result.status,
                data: researchResult,
                thinkingLog
            };

        } catch (error: any) {
            console.error("Get Research Status Failed:", error);
            throw new HttpsError('internal', `Failed to get status: ${error.message}`);
        }
    }
);
