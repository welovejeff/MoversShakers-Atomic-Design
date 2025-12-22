/**
 * Gmail Service - Interacts with Gmail API to search for past interactions and mentions
 */

import { GmailMessage } from '../types';

export interface GmailSearchResult {
    messages: GmailMessage[];
    totalResults: number;
}

export const gmailService = {
    /**
     * Search Gmail for a given query
     */
    async searchGmail(query: string, token: string): Promise<GmailSearchResult> {
        if (!token) throw new Error("Missing Gmail access token");

        const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=10`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.message || "Failed to search Gmail");
            }

            const data = await response.json();
            const messages = data.messages || [];

            // Resolve basic details for each message
            const details = await Promise.all(
                messages.map((m: { id: string }) => this.getMessageDetails(m.id, token))
            );

            return {
                messages: details.filter(Boolean) as GmailMessage[],
                totalResults: data.resultSizeEstimate || 0
            };
        } catch (error) {
            console.error("Gmail search error:", error);
            throw error;
        }
    },

    /**
     * Get details for a specific message
     */
    async getMessageDetails(id: string, token: string): Promise<GmailMessage | null> {
        const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Subject&metadataHeaders=Date`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) return null;

            const data = await response.json();
            const headers = data.payload?.headers || [];

            const getHeader = (name: string) => headers.find((h: any) => h.name === name)?.value || '';

            return {
                id: data.id,
                threadId: data.threadId,
                snippet: data.snippet,
                date: getHeader('Date'),
                from: getHeader('From'),
                to: getHeader('To'),
                subject: getHeader('Subject')
            };
        } catch (error) {
            return null;
        }
    }
};
