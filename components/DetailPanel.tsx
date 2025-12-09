import React, { useState, useEffect } from 'react';
import { Contact, Priority } from '../types';
import { researchContact, draftMessage } from '../services/geminiService';
import { Card, Button, Input, Badge, Loader, Typography, Alert } from '@welovejeff/movers-react';
import { db } from '../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

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
    const [commentsValue, setCommentsValue] = useState(contact.comments || "");
    const [isEditingComments, setIsEditingComments] = useState(false);
    const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'notes' | 'research' | 'writer'>('notes');

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
                            researchSources: data.sources || []
                        });
                    }
                }
            } catch (e) {
                console.log('No cached research found:', e);
            }
        };

        fetchCachedResearch();
    }, [contact.id]);

    const handleResearch = async () => {
        setResearching(true);
        try {
            const result = await researchContact(contact);
            onUpdateContact({
                ...contact,
                researchNotes: result.notes,
                researchSources: result.sources
            });
        } catch (e) {
            alert("Research failed. Check API configuration.");
        } finally {
            setResearching(false);
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
        <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', minHeight: 0 }}>

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                    <section style={{
                        padding: '1rem',
                        background: '#f5f5f5',
                        border: '2px solid #111'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                                <Typography variant="caption" style={{ fontWeight: 600, minWidth: '100px', paddingTop: '0.5rem' }}>
                                    Comments:
                                </Typography>
                                {isEditingComments ? (
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <textarea
                                            value={commentsValue}
                                            onChange={(e) => setCommentsValue(e.target.value)}
                                            placeholder="Add notes about this contact..."
                                            style={{
                                                width: '100%',
                                                padding: '0.5rem',
                                                border: '2px solid #111',
                                                fontFamily: 'Inter, sans-serif',
                                                fontSize: '0.875rem',
                                                resize: 'vertical',
                                                minHeight: '60px'
                                            }}
                                            autoFocus
                                        />
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Button
                                                variant="primary"
                                                size="small"
                                                onClick={() => {
                                                    onUpdateContact({ ...contact, comments: commentsValue.trim() });
                                                    setIsEditingComments(false);
                                                }}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="small"
                                                onClick={() => {
                                                    setCommentsValue(contact.comments || "");
                                                    setIsEditingComments(false);
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            background: '#fff',
                                            border: '2px solid #ddd',
                                            cursor: 'pointer',
                                            minHeight: '40px'
                                        }}
                                        onClick={() => {
                                            setCommentsValue(contact.comments || "");
                                            setIsEditingComments(true);
                                        }}
                                    >
                                        <Typography variant="body1" style={{ color: contact.comments ? '#333' : '#999' }}>
                                            {contact.comments || 'Click to add notes...'}
                                        </Typography>
                                    </div>
                                )}
                            </div>
                        </div>
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
                                        <Loader size="small" /> Researching...
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
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem'
                                }}>
                                    {contact.researchNotes.split('\n').map((line, idx) => {
                                        const trimmedLine = line.trim();
                                        if (!trimmedLine) return null;

                                        // Section headers (lines with **Title:**)
                                        const sectionMatch = trimmedLine.match(/^\*\*(.+?):\*\*$/);
                                        if (sectionMatch) {
                                            return (
                                                <div key={idx} style={{
                                                    background: '#FFF000',
                                                    padding: '0.5rem 0.75rem',
                                                    marginTop: idx > 0 ? '0.5rem' : 0,
                                                    border: '2px solid #111',
                                                    fontWeight: 700,
                                                    fontSize: '0.875rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px'
                                                }}>
                                                    {sectionMatch[1]}
                                                </div>
                                            );
                                        }

                                        // Bullet points (lines starting with * or -)
                                        if (trimmedLine.startsWith('*') || trimmedLine.startsWith('-')) {
                                            const bulletContent = trimmedLine.replace(/^[\*\-]\s*/, '');
                                            // Parse bold text within bullets
                                            const parts = bulletContent.split(/\*\*([^*]+)\*\*/g);

                                            return (
                                                <div key={idx} style={{
                                                    display: 'flex',
                                                    gap: '0.75rem',
                                                    paddingLeft: '0.5rem',
                                                    alignItems: 'flex-start'
                                                }}>
                                                    <span style={{
                                                        width: '8px',
                                                        height: '8px',
                                                        background: '#FFF000',
                                                        border: '2px solid #111',
                                                        borderRadius: '50%',
                                                        flexShrink: 0,
                                                        marginTop: '0.4rem'
                                                    }} />
                                                    <span style={{
                                                        fontSize: '0.875rem',
                                                        lineHeight: 1.6,
                                                        color: '#333'
                                                    }}>
                                                        {parts.map((part, i) =>
                                                            i % 2 === 1
                                                                ? <strong key={i} style={{ color: '#111', fontWeight: 700 }}>{part}</strong>
                                                                : part
                                                        )}
                                                    </span>
                                                </div>
                                            );
                                        }

                                        // Regular paragraph text - also parse bold
                                        const parts = trimmedLine.split(/\*\*([^*]+)\*\*/g);
                                        return (
                                            <p key={idx} style={{
                                                margin: 0,
                                                fontSize: '0.875rem',
                                                lineHeight: 1.6,
                                                color: '#444'
                                            }}>
                                                {parts.map((part, i) =>
                                                    i % 2 === 1
                                                        ? <strong key={i} style={{ color: '#111', fontWeight: 700 }}>{part}</strong>
                                                        : part
                                                )}
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
        </Card>
    );
};

export default DetailPanel;