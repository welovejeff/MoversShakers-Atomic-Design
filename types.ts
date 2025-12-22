export enum Priority {
  Unprocessed = 'Unprocessed',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  Ignore = 'Ignore'
}

// Individual note entry for multi-note comments system
export interface Note {
  id: string;
  content: string;
  createdAt: string; // ISO timestamp
}

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  date: string;
  from: string;
  to: string;
  subject: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  position: string;
  location: string;
  linkedInUrl: string;
  email?: string;
  familiarity: string;
  comments: string; // Legacy single comment (for backward compat)
  category: string;

  // Multi-note system
  notes?: Note[];
  commentsSummary?: string; // AI-generated summary of notes

  // AI Enrichment Fields
  priority: Priority;
  priorityReasoning?: string;
  researchNotes?: string;
  draftMessage?: string;
  researchSources?: Array<{ uri: string, title: string }>;
  researchCitations?: Citation[];

  // Gmail Persistence
  gmailMessages?: GmailMessage[];
  lastGmailSearchDate?: string;
}

export interface PrioritizationResult {
  id: string;
  priority: Priority;
  reasoning: string;
}

export interface Citation {
  text: string;
  startIndex: number;
  endIndex: number;
  sourceIndices: number[];
}

export interface ResearchResult {
  notes: string;
  sources: Array<{ uri: string, title: string }>;
  citations?: Citation[];
}

// Kanban column status for outreach tracking
export enum OutreachStatus {
  Queued = 'Queued',
  Sent = 'Sent',
  Followup = 'Followup'
}

// Kanban task representing outreach to a contact
export interface OutreachTask {
  id: string;
  contactId: string;
  title: string;
  description?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: OutreachStatus;
  tags?: string[];
  progress?: number; // 0-100 for progress bar
  dueDate?: string;
  assignees?: string[];
  attachmentCount?: number;
  subtaskCount?: number;
  subtasksCompleted?: number;
}

export type ResearchStatus = 'idle' | 'in_progress' | 'completed' | 'failed';

export interface ResearchJob {
  interactionId: string;
  contactId: string;
  status: ResearchStatus;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}