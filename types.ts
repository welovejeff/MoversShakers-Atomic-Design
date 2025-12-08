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
  researchSources?: Array<{uri: string, title: string}>;
}

export interface PrioritizationResult {
  id: string;
  priority: Priority;
  reasoning: string;
}

export interface ResearchResult {
  notes: string;
  sources: Array<{uri: string, title: string}>;
}