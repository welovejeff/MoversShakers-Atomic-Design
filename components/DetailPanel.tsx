import React, { useState } from 'react';
import { Contact, Priority } from '../types';
import { researchContact, draftMessage } from '../services/geminiService';
import { Card, Button, Input, Badge, Loader, Typography, Alert } from '@welovejeff/movers-react';

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
        <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>

                {/* Agent 1: Deep Research */}
                <section style={{ marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <Typography variant="h4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            🔍 DEEP RESEARCH AGENT
                        </Typography>
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

                    <div style={{
                        background: '#f5f5f5',
                        border: '2px solid #111',
                        padding: '1.25rem',
                        minHeight: '120px'
                    }}>
                        {contact.researchNotes ? (
                            <div>
                                <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                                    {contact.researchNotes}
                                </Typography>
                                {contact.researchSources && contact.researchSources.length > 0 && (
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
                                        <Typography variant="caption" style={{ fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>
                                            Sources:
                                        </Typography>
                                        <ul style={{ margin: 0, paddingLeft: '1rem' }}>
                                            {contact.researchSources.map((source, idx) => (
                                                <li key={idx}>
                                                    <a
                                                        href={source.uri}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={{ fontSize: '0.75rem', color: '#111' }}
                                                    >
                                                        {source.title || source.uri}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Typography variant="body1" style={{ color: '#888', textAlign: 'center', paddingTop: '2rem' }}>
                                Click "Run Deep Research" to analyze this company and individual using Google Search.
                            </Typography>
                        )}
                    </div>
                </section>

                {/* Agent 2: Drafting */}
                <section>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <Typography variant="h4" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ✍️ OUTREACH WRITER
                        </Typography>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Input
                            value={draftPrompt}
                            onChange={(e) => setDraftPrompt(e.target.value)}
                            placeholder="E.g., Focus on their recent funding round..."
                            style={{ flex: 1 }}
                        />
                        <Button
                            variant="primary"
                            onClick={handleDraft}
                            disabled={drafting}
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

            </div>
        </Card>
    );
};

export default DetailPanel;