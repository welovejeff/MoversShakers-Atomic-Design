import React, { useState } from 'react';
import { OutreachTask, OutreachStatus } from '../types';
import { Card, Typography } from '@welovejeff/movers-react';

interface KanbanCardProps {
    task: OutreachTask;
    contactFamiliarity?: string;
    onDragStart: (e: React.DragEvent, task: OutreachTask) => void;
    onDescriptionChange: (taskId: string, newDescription: string) => void;
    onDeleteTask: (taskId: string) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({
    task,
    contactFamiliarity = '',
    onDragStart,
    onDescriptionChange,
    onDeleteTask
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isEditingDescription, setIsEditingDescription] = useState(false);
    const [editDescription, setEditDescription] = useState(task.description || '');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const getFamiliarityColor = (familiarity: string) => {
        switch (familiarity) {
            case 'Hot Lead': return { bg: '#FF4444', text: '#fff' };
            case 'Warm': return { bg: '#FFF000', text: '#111' };
            case 'Cold': return { bg: '#2196F3', text: '#fff' };
            case 'Familiar': return { bg: '#4CAF50', text: '#fff' };
            case 'Unfamiliar': return { bg: '#9E9E9E', text: '#fff' };
            case 'Remove': return { bg: '#111', text: '#fff' };
            default: return { bg: '#eee', text: '#111' };
        }
    };

    const statusColors = getFamiliarityColor(contactFamiliarity);

    const handleDragStart = (e: React.DragEvent) => {
        setIsDragging(true);
        onDragStart(e, task);

        // Create custom drag image with rotation
        const dragEl = e.currentTarget.cloneNode(true) as HTMLElement;
        dragEl.style.transform = 'rotate(3deg) scale(1.02)';
        dragEl.style.boxShadow = '8px 8px 0 rgba(0,0,0,0.25)';
        dragEl.style.position = 'absolute';
        dragEl.style.top = '-1000px';
        dragEl.style.width = '280px';
        document.body.appendChild(dragEl);
        e.dataTransfer.setDragImage(dragEl, 140, 40);
        setTimeout(() => dragEl.remove(), 0);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    const handleDescriptionBlur = () => {
        setIsEditingDescription(false);
        if (editDescription !== task.description) {
            onDescriptionChange(task.id, editDescription);
        }
    };

    const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleDescriptionBlur();
        } else if (e.key === 'Escape') {
            setEditDescription(task.description || '');
            setIsEditingDescription(false);
        }
    };

    return (
        <Card
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{
                cursor: isDragging ? 'grabbing' : 'grab',
                background: '#fff',
                marginBottom: '0.75rem',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
                transform: isDragging ? 'rotate(2deg) scale(0.98)' : undefined,
                boxShadow: isDragging ? '6px 6px 0 rgba(0,0,0,0.2)' : undefined,
                opacity: isDragging ? 0.6 : 1,
                borderColor: isDragging ? '#FFF000' : undefined
            }}
            hoverable
        >
            {/* Drag Handle + Status Badge Row */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                {/* Drag Handle */}
                <span style={{
                    marginRight: '0.5rem',
                    color: '#999',
                    fontSize: '0.8rem',
                    cursor: 'grab',
                    userSelect: 'none'
                }}>⋮⋮</span>

                {/* Static Status Badge */}
                {contactFamiliarity && (
                    <span
                        style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            background: statusColors.bg,
                            color: statusColors.text,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            fontFamily: 'Oswald, sans-serif',
                            textTransform: 'uppercase',
                            border: '2px solid #111',
                            letterSpacing: '0.5px'
                        }}
                    >
                        {contactFamiliarity}
                    </span>
                )}

                {/* Menu button */}
                <div style={{ marginLeft: 'auto', position: 'relative' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            color: '#666',
                            padding: '0 4px'
                        }}
                    >
                        ⋯
                    </button>

                    {isMenuOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: '2px',
                            background: '#fff',
                            border: '2px solid #111',
                            boxShadow: '3px 3px 0 #111',
                            zIndex: 100,
                            minWidth: '120px'
                        }}>
                            <div
                                onClick={() => { setIsMenuOpen(false); setIsEditingDescription(true); }}
                                style={{
                                    padding: '0.5rem 0.75rem',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    borderBottom: '1px solid #eee'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                            >
                                ✏️ Edit
                            </div>
                            <div
                                onClick={() => { setIsMenuOpen(false); onDeleteTask(task.id); }}
                                style={{
                                    padding: '0.5rem 0.75rem',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem',
                                    color: '#C62828'
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#ffebee')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                            >
                                🗑️ Remove
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Title */}
            <Typography variant="h4" style={{ fontSize: '0.95rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                {task.title}
            </Typography>

            {/* Description - Editable */}
            {isEditingDescription ? (
                <input
                    autoFocus
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    onBlur={handleDescriptionBlur}
                    onKeyDown={handleDescriptionKeyDown}
                    style={{
                        width: '100%',
                        padding: '0.5rem',
                        fontSize: '0.8rem',
                        fontFamily: 'Inter, sans-serif',
                        border: '2px solid #FFF000',
                        background: '#fffdf0',
                        marginBottom: '0.5rem'
                    }}
                    placeholder="Add a description..."
                />
            ) : (
                <Typography
                    variant="body2"
                    onClick={() => setIsEditingDescription(true)}
                    style={{
                        color: task.description ? '#666' : '#999',
                        fontSize: '0.8rem',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        fontStyle: task.description ? 'normal' : 'italic'
                    }}
                >
                    {task.description || 'Click to add description...'}
                </Typography>
            )}

            {/* Progress Bar (for In Progress tasks) */}
            {task.progress !== undefined && task.progress > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <Typography variant="caption" style={{ color: '#666', fontSize: '0.7rem' }}>Progress</Typography>
                        <Typography variant="caption" style={{ fontWeight: 600, fontSize: '0.7rem' }}>{task.progress}%</Typography>
                    </div>
                    <div style={{ height: '6px', background: '#eee', border: '1px solid #111', overflow: 'hidden' }}>
                        <div
                            style={{
                                height: '100%',
                                width: `${task.progress}%`,
                                background: 'linear-gradient(90deg, #FFF000 0%, #FFD700 100%)',
                                transition: 'width 0.3s ease'
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Due Date */}
            {task.dueDate && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem' }}>📅</span>
                    <Typography variant="caption" style={{ color: task.dueDate.includes('today') ? '#FF4444' : '#666', fontSize: '0.75rem' }}>
                        {task.dueDate}
                    </Typography>
                </div>
            )}
        </Card>
    );
};

export default KanbanCard;
