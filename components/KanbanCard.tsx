import React, { useState } from 'react';
import { OutreachTask } from '../types';
import { Card, Badge, Typography } from '@welovejeff/movers-react';

interface KanbanCardProps {
    task: OutreachTask;
    onDragStart: (e: React.DragEvent, task: OutreachTask) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ task, onDragStart }) => {
    const [isDragging, setIsDragging] = useState(false);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return { bg: '#FF4444', text: '#fff' };
            case 'MEDIUM': return { bg: '#FFF000', text: '#111' };
            case 'LOW': return { bg: '#4CAF50', text: '#fff' };
            default: return { bg: '#999', text: '#fff' };
        }
    };

    const getTagColor = (tag: string) => {
        const colors: Record<string, { bg: string, text: string }> = {
            'Design': { bg: '#E3F2FD', text: '#1976D2' },
            'Dev': { bg: '#E8F5E9', text: '#388E3C' },
            'Content': { bg: '#FFF8E1', text: '#F57C00' },
            'Research': { bg: '#F3E5F5', text: '#7B1FA2' },
            'Outreach': { bg: '#FFEBEE', text: '#C62828' }
        };
        return colors[tag] || { bg: '#f0f0f0', text: '#444' };
    };

    const priorityColors = getPriorityColor(task.priority);

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
            {/* Drag Handle + Priority Badge Row */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                {/* Drag Handle */}
                <span style={{
                    marginRight: '0.5rem',
                    color: '#999',
                    fontSize: '0.8rem',
                    cursor: 'grab',
                    userSelect: 'none'
                }}>⋮⋮</span>

                <span
                    style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        background: priorityColors.bg,
                        color: priorityColors.text,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        fontFamily: 'Oswald, sans-serif',
                        textTransform: 'uppercase',
                        border: '2px solid #111',
                        letterSpacing: '0.5px'
                    }}
                >
                    {task.priority}
                </span>

                {/* Menu button */}
                <button
                    style={{
                        marginLeft: 'auto',
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
            </div>

            {/* Title */}
            <Typography variant="h4" style={{ fontSize: '0.95rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                {task.title}
            </Typography>

            {/* Description */}
            {task.description && (
                <Typography variant="body2" style={{ color: '#666', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    {task.description}
                </Typography>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {task.tags.map((tag) => {
                        const tagColor = getTagColor(tag);
                        return (
                            <span
                                key={tag}
                                style={{
                                    padding: '2px 8px',
                                    background: tagColor.bg,
                                    color: tagColor.text,
                                    fontSize: '0.7rem',
                                    fontWeight: 500,
                                    border: '1px solid currentColor',
                                    borderRadius: '2px'
                                }}
                            >
                                {tag}
                            </span>
                        );
                    })}
                </div>
            )}

            {/* Progress Bar (for In Progress tasks) */}
            {task.progress !== undefined && task.progress > 0 && (
                <div style={{ marginBottom: '0.75rem' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem' }}>📅</span>
                    <Typography variant="caption" style={{ color: task.dueDate.includes('today') ? '#FF4444' : '#666', fontSize: '0.75rem' }}>
                        {task.dueDate}
                    </Typography>
                </div>
            )}

            {/* Bottom row: Assignees and counts */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                {/* Assignees */}
                <div style={{ display: 'flex' }}>
                    {task.assignees && task.assignees.map((initials, i) => (
                        <div
                            key={i}
                            style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: ['#FFF000', '#4CAF50', '#2196F3', '#FF9800'][i % 4],
                                border: '2px solid #111',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                marginLeft: i > 0 ? '-8px' : 0,
                                zIndex: task.assignees!.length - i,
                                fontFamily: 'Oswald, sans-serif'
                            }}
                        >
                            {initials}
                        </div>
                    ))}
                </div>

                {/* Attachment & Subtask counts */}
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    {task.attachmentCount !== undefined && task.attachmentCount > 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>
                            📎 {task.attachmentCount}
                        </span>
                    )}
                    {task.subtaskCount !== undefined && task.subtaskCount > 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>
                            ☑ {task.subtasksCompleted || 0}/{task.subtaskCount}
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default KanbanCard;

