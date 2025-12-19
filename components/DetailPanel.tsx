import React, { useState, useEffect } from 'react';
import { Contact, Priority, Citation, Note } from '../types';
import { researchContact, draftMessage, summarizeComments, startDeepResearch, getResearchProgress } from '../services/geminiService';
import { Card, Button, Input, Badge, Loader, Typography, Alert } from '@welovejeff/movers-react';
import { db } from '../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Citation superscript style
const citationStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.6rem',
    fontWeight: 700,
    color: '#0A66C2',
    cursor: 'pointer',
    textDecoration: 'none',
    verticalAlign: 'super',
    lineHeight: 1,
    marginLeft: '1px',
    padding: '0 2px',
};

// Render a citation superscript
const CitationSuperscript: React.FC<{ indices: number[]; sources: Array<{ uri: string, title: string }> }> = ({ indices, sources }) => {
    if (!indices.length || !sources.length) return null;

    // Get unique source numbers (1-indexed for display)
    const validIndices = indices.filter((i: number) => i < sources.length);
    const mappedNumbers = validIndices.map((i: number) => i + 1);
    const uniqueSet = new Set<number>(mappedNumbers);
    const sourceNumbers: number[] = Array.from(uniqueSet);
    if (!sourceNumbers.length) return null;

    return (
        <>
            {sourceNumbers.map((num: number) => {
                const source = sources[num - 1];
                return (
                    <a
                        key={num}
                        href={source?.uri || '#'}
                        target="_blank"
                        rel="noreferrer"
                        style={citationStyle}
                        title={source?.title || `Source ${num}`}
                    >
                        [{num}]
                    </a>
                );
            })}
        </>
    );
};

// Helper to escape regex special characters
const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Helper to parse text with markdown-style links and bold
const parseMarkdownText = (text: string) => {
    const parts = [];
    let remaining = text;

    // Pattern for links: [text](url) and citations: [cite: 1] and bold: **text**
    // We'll prioritize links, then citations, then bold
    // Actually, simple sequential splitting is easier if we don't nest.
    // Let's do a simple robust split.

    // Convert [cite: N] to superscript
    remaining = remaining.replace(/\[cite:\s*(\d+)\]/g, '<sup>[$1]</sup>');

    // We will use dangerouslySetInnerHTML for the processed HTML fragment to handle mixing tags
    // This requires sanitization if user content is untrusted, but here it's from our AI.
    // For safety, we'll replace the markdown syntax with HTML tags string-wise first

    // Bold
    remaining = remaining.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Links [text](url)
    remaining = remaining.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" style="color: #0A66C2; text-decoration: underline;">$1</a>');

    return <span dangerouslySetInnerHTML={{ __html: remaining }} />;
};
// Helper to render text with inline citations
const renderTextWithCitations = (
    text: string,
    citations: Citation[] | undefined,
    sources: Array<{ uri: string, title: string }> | undefined
): React.ReactNode[] => {
    if (!citations || !sources || citations.length === 0) {
        return [text];
    }

    // Sort citations by startIndex
    const sortedCitations = [...citations].sort((a, b) => a.startIndex - b.startIndex);

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedCitations.forEach((citation, idx) => {
        // Add text before this citation
        if (citation.startIndex > lastIndex) {
            elements.push(text.slice(lastIndex, citation.startIndex));
        }

        // Add the cited text with superscript
        elements.push(
            <span key={`cite-${idx}`}>
                {text.slice(citation.startIndex, citation.endIndex)}
                <CitationSuperscript indices={citation.sourceIndices} sources={sources} />
            </span>
        );

        lastIndex = citation.endIndex;
    });

    // Add remaining text
    if (lastIndex < text.length) {
        elements.push(text.slice(lastIndex));
    }

    return elements;
};

interface DetailPanelProps {
    contact: Contact;
    onUpdateContact: (updated: Contact) => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ contact, onUpdateContact }) => {
    const [researching, setResearching] = useState(false);
    const [drafting, setDrafting] = useState(false);
    const [draftPrompt, setDraftPrompt] = useState("Highlight our shared focus on retail innovation.");
    const [isEditingCategory, setIsEditingCategory] = useState(false);
    const [categoryValue, setCategoryValue] = useState(contact.category || "");
    const [newNoteValue, setNewNoteValue] = useState("");
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'notes' | 'research' | 'writer'>('notes');
    const [researchInteractionId, setResearchInteractionId] = useState<string | null>(null);
    const [researchStatus, setResearchStatus] = useState<string>('idle');
    const [thinkingLog, setThinkingLog] = useState<string[]>([]);

    // Helper to generate unique ID for notes
    const generateNoteId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

    // Helper to format relative time
    const getRelativeTime = (timestamp: string): string => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return then.toLocaleDateString();
    };

    // Add a new note
    const handleAddNote = () => {
        if (!newNoteValue.trim()) return;

        const newNote: Note = {
            id: generateNoteId(),
            content: newNoteValue.trim(),
            createdAt: new Date().toISOString()
        };

        const updatedNotes = [...(contact.notes || []), newNote];
        onUpdateContact({ ...contact, notes: updatedNotes });
        setNewNoteValue("");
    };

    // Delete a note
    const handleDeleteNote = (noteId: string) => {
        const updatedNotes = (contact.notes || []).filter(n => n.id !== noteId);
        onUpdateContact({ ...contact, notes: updatedNotes, commentsSummary: updatedNotes.length === 0 ? undefined : contact.commentsSummary });
    };

    // Generate AI summary
    const handleSummarize = async () => {
        if (!contact.notes || contact.notes.length === 0) return;

        setIsSummarizing(true);
        try {
            const summary = await summarizeComments(
                contact.notes,
                `${contact.firstName} ${contact.lastName}`
            );
            onUpdateContact({ ...contact, commentsSummary: summary });
        } catch (e) {
            console.error('Summarization failed:', e);
        } finally {
            setIsSummarizing(false);
        }
    };

    const statusOptions = ['Familiar', 'Unfamiliar', 'Remove', 'Hot Lead', 'Warm', 'Cold'];

    // Load cached research from Firestore on contact change
    useEffect(() => {
        const fetchCachedResearch = async () => {
            if (contact.researchNotes) return; // Already have notes locally

            try {
                const docRef = doc(db, 'research', contact.id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    // Check if cache is still valid
                    if (data.expiresAt && data.expiresAt.toMillis() > Date.now()) {
                        onUpdateContact({
                            ...contact,
                            researchNotes: data.notes,
                            researchSources: data.sources || [],
                            researchCitations: data.citations || []
                        });
                    }
                }
            } catch (e) {
                console.log('No cached research found:', e);
            }
        };

        fetchCachedResearch();
    }, [contact.id]);

    // Poll for research progress
    useEffect(() => {
        let pollInterval: NodeJS.Timeout;

        if (researching && researchInteractionId) {
            pollInterval = setInterval(async () => {
                try {
                    const progress = await getResearchProgress(contact.id, researchInteractionId);
                    setResearchStatus(progress.status);

                    // Update thinking log if available
                    if (progress.thinkingLog && progress.thinkingLog.length > 0) {
                        setThinkingLog(progress.thinkingLog);
                    }

                    if (progress.status === 'completed' && progress.data) {
                        onUpdateContact({
                            ...contact,
                            researchNotes: progress.data.notes,
                            researchSources: progress.data.sources,
                            researchCitations: progress.data.citations
                        });
                        setResearching(false);
                        setResearchInteractionId(null);
                        setResearchStatus('idle');
                        setThinkingLog([]); // Clear on completion
                    } else if (progress.status === 'failed') {
                        setResearching(false);
                        setResearchInteractionId(null);
                        setResearchStatus('idle');
                        setThinkingLog([]);
                        alert("Deep research failed. Please try again.");
                    }
                } catch (e) {
                    console.error("Polling error:", e);
                    // Don't stop polling on transient errors
                }
            }, 5000); // Poll every 5s
        }

        return () => {
            if (pollInterval) clearInterval(pollInterval);
        };
    }, [researching, researchInteractionId, contact.id]);

    const handleResearch = async () => {
        setResearching(true);
        setResearchStatus('starting');
        try {
            const result = await startDeepResearch(contact);
            setResearchInteractionId(result.interactionId);
            setResearchStatus(result.status);
            // NOTE: researching state remains true to trigger polling
        } catch (e) {
            console.error(e);
            alert("Deep research failed to start. Falling back to quick research.");

            // Fallback to quick research
            try {
                const result = await researchContact(contact);
                onUpdateContact({
                    ...contact,
                    researchNotes: result.notes,
                    researchSources: result.sources,
                    researchCitations: result.citations
                });
            } catch (fallbackError) {
                alert("Quick research also failed.");
            } finally {
                setResearching(false);
                setResearchStatus('idle');
            }
        }
    };

    const handleDraft = async () => {
        setDrafting(true);
        try {
            const notes = contact.researchNotes || "No specific research conducted yet.";
            const message = await draftMessage(contact, notes, draftPrompt);
            onUpdateContact({
                ...contact,
                draftMessage: message
            });
        } catch (e) {
            alert("Drafting failed.");
        } finally {
            setDrafting(false);
        }
    };

    return (
        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: '#fff',
                border: '2px solid #111',
                boxShadow: '4px 4px 0 #111'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: '2px solid #111',
                    background: '#FFF000'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            {/* @ts-ignore - Web Component */}
                            <ms-avatar
                                initials={`${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`}
                                size="lg"
                                style={{ flexShrink: 0 }}
                            ></ms-avatar>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                    <Typography variant="h2" style={{ margin: 0 }}>
                                        {contact.firstName} {contact.lastName}
                                    </Typography>
                                    {isEditingCategory ? (
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <Input
                                                value={categoryValue}
                                                onChange={(e) => setCategoryValue(e.target.value)}
                                                placeholder="Category tag..."
                                                style={{ width: '120px', fontSize: '0.75rem' }}
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        onUpdateContact({ ...contact, category: categoryValue.trim() });
                                                        setIsEditingCategory(false);
                                                    } else if (e.key === 'Escape') {
                                                        setCategoryValue(contact.category || "");
                                                        setIsEditingCategory(false);
                                                    }
                                                }}
                                            />
                                            <Button
                                                variant="primary"
                                                size="small"
                                                onClick={() => {
                                                    onUpdateContact({ ...contact, category: categoryValue.trim() });
                                                    setIsEditingCategory(false);
                                                }}
                                            >
                                                ✓
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="small"
                                                onClick={() => {
                                                    setCategoryValue(contact.category || "");
                                                    setIsEditingCategory(false);
                                                }}
                                            >
                                                ✕
                                            </Button>
                                        </div>
                                    ) : contact.category ? (
                                        <Badge
                                            variant="info"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => {
                                                setCategoryValue(contact.category || "");
                                                setIsEditingCategory(true);
                                            }}
                                        >
                                            {contact.category} ✎
                                        </Badge>
                                    ) : (
                                        <Button
                                            variant="ghost"
                                            size="small"
                                            onClick={() => {
                                                setCategoryValue("");
                                                setIsEditingCategory(true);
                                            }}
                                            style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                        >
                                            + Add Tag
                                        </Button>
                                    )}

                                    {/* Status Dropdown Chip */}
                                    <div style={{ position: 'relative' }}>
                                        <Badge
                                            variant={contact.familiarity === 'Familiar' || contact.familiarity === 'Hot Lead' ? 'success' :
                                                contact.familiarity === 'Remove' || contact.familiarity === 'Cold' ? 'error' : 'warning'}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                                        >
                                            {contact.familiarity || 'Status'} ▾
                                        </Badge>
                                        {isStatusDropdownOpen && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                marginTop: '0.25rem',
                                                background: '#fff',
                                                border: '2px solid #111',
                                                boxShadow: '3px 3px 0 #111',
                                                zIndex: 100,
                                                minWidth: '120px'
                                            }}>
                                                {statusOptions.map((status) => (
                                                    <div
                                                        key={status}
                                                        onClick={() => {
                                                            onUpdateContact({ ...contact, familiarity: status });
                                                            setIsStatusDropdownOpen(false);
                                                        }}
                                                        style={{
                                                            padding: '0.5rem 0.75rem',
                                                            cursor: 'pointer',
                                                            background: contact.familiarity === status ? '#FFF000' : '#fff',
                                                            fontWeight: contact.familiarity === status ? 600 : 400,
                                                            fontSize: '0.875rem',
                                                            borderBottom: '1px solid #eee'
                                                        }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                                                        onMouseLeave={(e) => (e.currentTarget.style.background = contact.familiarity === status ? '#FFF000' : '#fff')}
                                                    >
                                                        {status}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Typography variant="body1" style={{ fontWeight: 500, margin: '0.5rem 0' }}>
                                    {contact.position}
                                </Typography>
                                <Typography variant="caption" style={{ color: '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>{contact.company}</span>
                                    <span>•</span>
                                    <span>{contact.location}</span>
                                </Typography>
                            </div>
                        </div>
                        <a
                            href={contact.linkedInUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '40px',
                                height: '40px',
                                background: '#0A66C2',
                                border: '2px solid #111',
                                boxShadow: '2px 2px 0 #111',
                                transition: 'all 0.2s ease'
                            }}
                            title="View LinkedIn Profile"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="white"
                            >
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </a>
                    </div>

                    {/* AI Reasoning Badge */}
                    {contact.priority !== Priority.Unprocessed && (
                        <Alert variant="info" style={{ marginTop: '1rem' }}>
                            <strong>AI Priority Reasoning:</strong> {contact.priorityReasoning || "Manual priority set."}
                        </Alert>
                    )}
                </div>

                {/* Tab Navigation */}
                <div style={{
                    display: 'flex',
                    borderBottom: '2px solid #e5e5e5',
                    padding: '0 1.5rem',
                    background: '#fff'
                }}>
                    {[
                        { id: 'notes', label: '📋 NOTES', icon: '' },
                        { id: 'research', label: '🔍 RESEARCH', icon: '' },
                        { id: 'writer', label: '✍️ WRITER', icon: '' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'notes' | 'research' | 'writer')}
                            style={{
                                padding: '0.75rem 1.25rem',
                                border: 'none',
                                background: 'transparent',
                                cursor: 'pointer',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                color: activeTab === tab.id ? '#111' : '#666',
                                borderBottom: activeTab === tab.id ? '3px solid #FFF000' : '3px solid transparent',
                                marginBottom: '-2px',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '1.5rem', minHeight: 0, overscrollBehavior: 'contain' }}>

                    {/* Notes Tab */}
                    {activeTab === 'notes' && (
                        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Add Note Input */}
                            <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                padding: '1rem',
                                background: '#FFF000',
                                border: '2px solid #111',
                                boxShadow: '3px 3px 0 #111'
                            }}>
                                <input
                                    type="text"
                                    value={newNoteValue}
                                    onChange={(e) => setNewNoteValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                    placeholder="Add a note about this contact..."
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        border: '2px solid #111',
                                        fontFamily: 'Inter, sans-serif',
                                        fontSize: '0.875rem',
                                        background: '#fff'
                                    }}
                                />
                                <Button
                                    variant="primary"
                                    onClick={handleAddNote}
                                    disabled={!newNoteValue.trim()}
                                >
                                    + Add
                                </Button>
                            </div>

                            {/* Notes Timeline */}
                            {contact.notes && contact.notes.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {contact.notes.slice().reverse().map((note) => (
                                        <div
                                            key={note.id}
                                            style={{
                                                display: 'flex',
                                                gap: '0.75rem',
                                                alignItems: 'flex-start'
                                            }}
                                        >
                                            {/* Timeline Spoke */}
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                paddingTop: '0.5rem'
                                            }}>
                                                <div style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    borderRadius: '50%',
                                                    background: '#FFF000',
                                                    border: '2px solid #111',
                                                    flexShrink: 0
                                                }} />
                                                <div style={{
                                                    width: '2px',
                                                    flex: 1,
                                                    background: '#ddd',
                                                    marginTop: '4px'
                                                }} />
                                            </div>

                                            {/* Note Card */}
                                            <div style={{
                                                flex: 1,
                                                padding: '0.75rem 1rem',
                                                background: '#fff',
                                                border: '2px solid #111',
                                                boxShadow: '2px 2px 0 #111',
                                                position: 'relative'
                                            }}>
                                                {/* Delete Button */}
                                                <button
                                                    onClick={() => handleDeleteNote(note.id)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '0.5rem',
                                                        right: '0.5rem',
                                                        background: 'transparent',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: '1rem',
                                                        color: '#999',
                                                        padding: '0 4px',
                                                        lineHeight: 1
                                                    }}
                                                    title="Delete note"
                                                >
                                                    ×
                                                </button>

                                                <Typography variant="body1" style={{ paddingRight: '1.5rem', lineHeight: 1.5 }}>
                                                    {note.content}
                                                </Typography>
                                                <Typography variant="caption" style={{ color: '#888', marginTop: '0.5rem', display: 'block' }}>
                                                    {getRelativeTime(note.createdAt)}
                                                </Typography>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div style={{
                                    padding: '2rem',
                                    background: '#f5f5f5',
                                    border: '2px dashed #ddd',
                                    textAlign: 'center'
                                }}>
                                    <Typography variant="body1" style={{ color: '#888' }}>
                                        No notes yet. Add your first note above!
                                    </Typography>
                                </div>
                            )}

                            {/* AI Summary Section */}
                            {contact.notes && contact.notes.length >= 2 && (
                                <div style={{
                                    padding: '1rem',
                                    background: '#f9f9f9',
                                    border: '2px solid #ddd',
                                    marginTop: '0.5rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: contact.commentsSummary ? '0.75rem' : 0 }}>
                                        <Typography variant="caption" style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            ✨ AI Summary
                                        </Typography>
                                        <Button
                                            variant="ghost"
                                            size="small"
                                            onClick={handleSummarize}
                                            disabled={isSummarizing}
                                        >
                                            {isSummarizing ? (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Loader size="small" /> Summarizing...
                                                </span>
                                            ) : contact.commentsSummary ? 'Regenerate' : 'Generate Summary'}
                                        </Button>
                                    </div>
                                    {contact.commentsSummary && (
                                        <Typography variant="body2" style={{ fontStyle: 'italic', color: '#555', lineHeight: 1.6 }}>
                                            {contact.commentsSummary}
                                        </Typography>
                                    )}
                                </div>
                            )}
                        </section>
                    )}

                    {/* Research Tab */}
                    {activeTab === 'research' && (
                        <section>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <Button
                                    variant="secondary"
                                    onClick={handleResearch}
                                    disabled={researching}
                                    size="small"
                                >
                                    {researching ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Loader size="small" />
                                            {researchStatus === 'starting' ? 'Starting...' :
                                                researchStatus === 'in_progress' ? 'Deep Researching...' :
                                                    'Processing...'}
                                        </span>
                                    ) : 'Run Deep Research'}
                                </Button>
                            </div>

                            {/* Status Tracker Stepper */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem',
                                background: '#f5f5f5',
                                border: '2px solid #111',
                                marginBottom: '1rem'
                            }}>
                                {[
                                    { num: 1, label: 'COMPANY', done: !!contact.researchNotes },
                                    { num: 2, label: 'PERSON', done: !!contact.researchNotes },
                                    { num: 3, label: 'HOOKS', done: !!contact.researchNotes },
                                    { num: 4, label: 'INSIGHTS', done: !!contact.researchNotes }
                                ].map((step, idx, arr) => (
                                    <React.Fragment key={step.num}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '50%',
                                                background: step.done ? '#FFF000' : '#fff',
                                                border: '2px solid #111',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 700,
                                                fontSize: '0.75rem'
                                            }}>
                                                {step.done ? '✓' : step.num}
                                            </div>
                                            <Typography variant="caption" style={{ fontWeight: 600 }}>
                                                {step.label}
                                            </Typography>
                                        </div>
                                        {idx < arr.length - 1 && (
                                            <div style={{
                                                flex: 1,
                                                height: '2px',
                                                background: step.done ? '#FFF000' : '#ddd',
                                                margin: '0 0.5rem',
                                                border: step.done ? '1px solid #111' : 'none'
                                            }} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Skeleton Loading + Reasoning Feed (when researching) */}
                            {researching && !contact.researchNotes && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Reasoning Feed */}
                                    {thinkingLog.length > 0 && (
                                        <div style={{
                                            background: '#f5f5f5',
                                            border: '2px solid #ddd',
                                            padding: '1rem',
                                            maxHeight: '200px',
                                            overflowY: 'auto'
                                        }}>
                                            <Typography variant="caption" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                                                🧠 AI REASONING
                                            </Typography>
                                            {thinkingLog.map((thought, idx) => (
                                                <div key={idx} style={{ fontSize: '0.8rem', color: '#555', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                                                    {thought.slice(0, 200)}{thought.length > 200 ? '...' : ''}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Skeleton Placeholders */}
                                    <div style={{
                                        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                                        backgroundSize: '200% 100%',
                                        animation: 'shimmer 1.5s infinite',
                                        height: '24px',
                                        borderRadius: '4px',
                                        border: '2px solid #ddd'
                                    }} />
                                    <div style={{
                                        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                                        backgroundSize: '200% 100%',
                                        animation: 'shimmer 1.5s infinite',
                                        height: '80px',
                                        borderRadius: '4px',
                                        border: '2px solid #ddd'
                                    }} />
                                    <div style={{
                                        background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                                        backgroundSize: '200% 100%',
                                        animation: 'shimmer 1.5s infinite',
                                        height: '60px',
                                        borderRadius: '4px',
                                        border: '2px solid #ddd'
                                    }} />
                                    <style>{`
                                        @keyframes shimmer {
                                            0% { background-position: 200% 0; }
                                            100% { background-position: -200% 0; }
                                        }
                                    `}</style>
                                </div>
                            )}

                            {/* Research Output */}
                            {contact.researchNotes && (
                                <div style={{
                                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                                    border: '2px solid #111',
                                    boxShadow: '4px 4px 0 #111',
                                    padding: '1.5rem',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        marginBottom: '1rem',
                                        paddingBottom: '0.75rem',
                                        borderBottom: '2px solid #FFF000'
                                    }}>
                                        <span style={{ fontSize: '1.5rem' }}>📊</span>
                                        <Typography variant="h3" style={{ margin: 0 }}>
                                            Research Findings
                                        </Typography>
                                    </div>

                                    {/* Parse and render markdown-style content */}
                                    {/* Action Buttons */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                        marginBottom: '1rem',
                                        justifyContent: 'flex-end'
                                    }}>
                                        <Button
                                            variant="ghost"
                                            size="small"
                                            onClick={() => {
                                                if (contact.researchNotes) {
                                                    navigator.clipboard.writeText(contact.researchNotes);
                                                    alert("Research copied to clipboard!");
                                                }
                                            }}
                                        >
                                            📋 Copy
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="small"
                                            onClick={() => {
                                                if (contact.researchNotes) {
                                                    const newNote: Note = {
                                                        id: generateNoteId(),
                                                        content: "Saved Research: " + contact.researchNotes.slice(0, 50) + "...",
                                                        createdAt: new Date().toISOString()
                                                    };
                                                    // Add full research as a note? Might be too long. 
                                                    // Let's add a note saying "Research Saved" and maybe append to a separate field or just add it.
                                                    // User asked "Save this research elsewhere". A note ensures it's in the specialized "Notes" tab.
                                                    // But notes are small cards. Let's add it anyway.
                                                    const updatedNotes = [...(contact.notes || []), { ...newNote, content: "RESEARCH SAVED: \n" + contact.researchNotes }];
                                                    onUpdateContact({ ...contact, notes: updatedNotes });
                                                    alert("Research saved to Notes tab.");
                                                }
                                            }}
                                        >
                                            💾 Save to Notes
                                        </Button>
                                    </div>

                                    {/* Parse and render markdown-style content */}
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.75rem',
                                        fontFamily: 'Inter, sans-serif'
                                    }}>
                                        {contact.researchNotes.split('\n').map((line, idx) => {
                                            const trimmedLine = line.trim();
                                            if (!trimmedLine) return <div key={idx} style={{ height: '0.25rem' }} />;

                                            // H1: # Title
                                            if (trimmedLine.startsWith('# ')) {
                                                return (
                                                    <div key={idx} style={{
                                                        background: '#FFF000',
                                                        padding: '0.5rem 0.75rem',
                                                        marginTop: '1rem',
                                                        marginBottom: '0.5rem',
                                                        border: '2px solid #111',
                                                        fontWeight: 800,
                                                        fontSize: '1.25rem',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        {trimmedLine.replace(/^#\s*/, '')}
                                                    </div>
                                                );
                                            }

                                            // H2: ## Title
                                            if (trimmedLine.startsWith('## ')) {
                                                return (
                                                    <h2 key={idx} style={{
                                                        fontSize: '1.1rem',
                                                        fontWeight: 700,
                                                        margin: '1.5rem 0 0.5rem 0',
                                                        borderBottom: '2px solid #FFF000',
                                                        display: 'inline-block',
                                                        paddingBottom: '2px'
                                                    }}>
                                                        {trimmedLine.replace(/^##\s*/, '')}
                                                    </h2>
                                                );
                                            }

                                            // H3: ### Title (or just bolded line commonly)
                                            if (trimmedLine.startsWith('### ')) {
                                                return (
                                                    <h3 key={idx} style={{
                                                        fontSize: '1rem',
                                                        fontWeight: 700,
                                                        margin: '1rem 0 0.25rem 0',
                                                        color: '#111'
                                                    }}>
                                                        {trimmedLine.replace(/^###\s*/, '')}
                                                    </h3>
                                                );
                                            }

                                            // H4: #### Title
                                            if (trimmedLine.startsWith('#### ')) {
                                                return (
                                                    <h4 key={idx} style={{
                                                        fontSize: '0.9rem',
                                                        fontWeight: 700,
                                                        margin: '0.75rem 0 0.25rem 0',
                                                        color: '#444',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {trimmedLine.replace(/^####\s*/, '')}
                                                    </h4>
                                                );
                                            }

                                            // Bullet points (lines starting with * or -)
                                            if (trimmedLine.match(/^[\*\-]\s/)) {
                                                const bulletContent = trimmedLine.replace(/^[\*\-]\s*/, '');
                                                return (
                                                    <div key={idx} style={{
                                                        display: 'flex',
                                                        gap: '0.75rem',
                                                        paddingLeft: '0.5rem',
                                                        alignItems: 'flex-start'
                                                    }}>
                                                        <span style={{
                                                            width: '6px',
                                                            height: '6px',
                                                            background: '#111',
                                                            borderRadius: '50%',
                                                            flexShrink: 0,
                                                            marginTop: '0.6rem'
                                                        }} />
                                                        <span style={{
                                                            fontSize: '0.9rem',
                                                            lineHeight: 1.6,
                                                            color: '#333'
                                                        }}>
                                                            {parseMarkdownText(bulletContent)}
                                                        </span>
                                                    </div>
                                                );
                                            }

                                            // Regular paragraph text
                                            return (
                                                <p key={idx} style={{
                                                    margin: 0,
                                                    fontSize: '0.9rem',
                                                    lineHeight: 1.6,
                                                    color: '#444'
                                                }}>
                                                    {parseMarkdownText(trimmedLine)}
                                                </p>
                                            );


                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Research Sources */}
                            {contact.researchSources && contact.researchSources.length > 0 && (
                                <div style={{
                                    background: '#f5f5f5',
                                    border: '2px solid #111',
                                    padding: '1rem'
                                }}>
                                    <Typography variant="overline" style={{ marginBottom: '0.5rem', display: 'block' }}>
                                        Sources ({contact.researchSources.length})
                                    </Typography>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {contact.researchSources.map((source, idx) => (
                                            <a
                                                key={idx}
                                                href={source.uri}
                                                target="_blank"
                                                rel="noreferrer"
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    fontSize: '0.8rem',
                                                    color: '#0A66C2',
                                                    textDecoration: 'none'
                                                }}
                                            >
                                                🔗 {source.title || source.uri}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Empty State */}
                            {!contact.researchNotes && !researching && (
                                <div style={{
                                    background: '#fff',
                                    border: '2px dashed #ddd',
                                    padding: '2rem',
                                    textAlign: 'center'
                                }}>
                                    <Typography variant="body1" style={{ color: '#888' }}>
                                        Click "Run Deep Research" to gather insights about this contact.
                                    </Typography>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Writer Tab */}
                    {activeTab === 'writer' && (
                        <section style={{ width: '100%' }}>

                            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', width: '100%' }}>
                                <div style={{ flex: 1 }}>
                                    <input
                                        type="text"
                                        value={draftPrompt}
                                        onChange={(e) => setDraftPrompt(e.target.value)}
                                        placeholder="E.g., Focus on their recent funding round..."
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            border: '2px solid #111',
                                            fontFamily: 'Inter, sans-serif',
                                            fontSize: '0.875rem',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                </div>
                                <Button
                                    variant="primary"
                                    onClick={handleDraft}
                                    disabled={drafting}
                                    style={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                                >
                                    {drafting ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Loader size="small" /> Writing...
                                        </span>
                                    ) : 'Draft Message'}
                                </Button>
                            </div>

                            <div style={{
                                background: '#fff',
                                border: '2px solid #111',
                                boxShadow: '4px 4px 0 #111',
                                padding: '1.25rem',
                                minHeight: '150px'
                            }}>
                                {contact.draftMessage ? (
                                    <textarea
                                        style={{
                                            width: '100%',
                                            minHeight: '150px',
                                            border: 'none',
                                            outline: 'none',
                                            resize: 'none',
                                            fontFamily: 'Inter, sans-serif',
                                            fontSize: '0.875rem',
                                            lineHeight: 1.6
                                        }}
                                        value={contact.draftMessage}
                                        onChange={(e) => onUpdateContact({ ...contact, draftMessage: e.target.value })}
                                    />
                                ) : (
                                    <Typography variant="body1" style={{ color: '#888', textAlign: 'center', paddingTop: '3rem' }}>
                                        Generated message drafts will appear here.
                                    </Typography>
                                )}
                            </div>
                        </section>
                    )}

                </div>
            </div>
        </div >
    );
};

export default DetailPanel;