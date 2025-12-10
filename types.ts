export enum Priority {
  Unprocessed = 'Unprocessed',
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
  Ignore = 'Ignore'
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  position: string;
  location: string;
  linkedInUrl: string;
  familiarity: string;
  comments: string;
  category: string;

  // AI Enrichment Fields
  priority: Priority;
  priorityReasoning?: string;
  researchNotes?: string;
  draftMessage?: string;
  researchSources?: Array<{ uri: string, title: string }>;
  researchCitations?: Citation[];
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