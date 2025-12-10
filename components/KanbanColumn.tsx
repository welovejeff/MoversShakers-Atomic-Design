import React, { useState } from 'react';
import { OutreachTask, OutreachStatus, Contact } from '../types';
import { Typography, Button } from '@welovejeff/movers-react';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
    status: OutreachStatus;
    tasks: OutreachTask[];
    contacts: Contact[];
    customTitle?: string;
    onDragStart: (e: React.DragEvent, task: OutreachTask) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, status: OutreachStatus) => void;
    onRenameColumn?: (status: OutreachStatus, newName: string) => void;
    onDescriptionChange: (taskId: string, newDescription: string) => void;
    onDeleteTask: (taskId: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
    status,
    tasks,
    contacts,
    customTitle,
    onDragStart,
    onDragOver,
    onDrop,
    onRenameColumn,
    onDescriptionChange,
    onDeleteTask
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [isDragOver, setIsDragOver] = useState(false);

    const getColumnConfig = (status: OutreachStatus) => {
        switch (status) {
            case OutreachStatus.Queued:
                return { title: 'QUEUED', color: '#999', bgColor: '#f8f8f8' };
            case OutreachStatus.Sent:
                return { title: 'SENT / AWAITING', color: '#FFF000', bgColor: '#fffdf0' };
            case OutreachStatus.Followup:
                return { title: 'FOLLOW UP', color: '#4CAF50', bgColor: '#f0fff0' };
            default:
                return { title: status, color: '#999', bgColor: '#f8f8f8' };
        }
    };

    const config = getColumnConfig(status);
    const displayTitle = customTitle || config.title;
    const taskCount = tasks.length;

    const handleDoubleClick = () => {
        setEditValue(displayTitle);
        setIsEditing(true);
    };

    const handleBlur = () => {
        if (editValue.trim() && editValue !== displayTitle) {
            onRenameColumn?.(status, editValue.trim().toUpperCase());
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBlur();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        // Only set to false if we're actually leaving the column (not entering a child)
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setIsDragOver(false);
        }
    };

    const handleDragOverInternal = (e: React.DragEvent) => {
        e.preventDefault();
        onDragOver(e);
    };

    const handleDropInternal = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        onDrop(e, status);
    };

    return (
        <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOverInternal}
            onDrop={handleDropInternal}
            style={{
                flex: 1,
                minWidth: '280px',
                maxWidth: '350px',
                display: 'flex',
                flexDirection: 'column',
                background: isDragOver ? `${config.bgColor}` : config.bgColor,
                border: isDragOver ? '3px dashed #FFF000' : '2px solid #111',
                height: '100%',
                transition: 'all 0.2s ease',
                boxShadow: isDragOver ? 'inset 0 0 20px rgba(255, 240, 0, 0.3)' : undefined,
                transform: isDragOver ? 'scale(1.01)' : undefined
            }}
        >
            {/* Column Header */}
            <div
                style={{
                    padding: '1rem',
                    borderBottom: isDragOver ? '3px dashed #FFF000' : '2px solid #111',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: isDragOver ? '#FFF000' : '#fff',
                    transition: 'all 0.2s ease'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                        style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: config.color,
                            border: '2px solid #111',
                            animation: isDragOver ? 'pulse 1s infinite' : undefined
                        }}
                    />
                    {isEditing ? (
                        <input
                            autoFocus
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleBlur}
                            onKeyDown={handleKeyDown}
                            style={{
                                fontSize: '0.85rem',
                                fontFamily: 'Oswald, sans-serif',
                                fontWeight: 700,
                                letterSpacing: '0.5px',
                                textTransform: 'uppercase',
                                border: '2px solid #FFF000',
                                padding: '2px 6px',
                                background: '#FFF000',
                                outline: 'none',
                                width: '120px'
                            }}
                        />
                    ) : (
                        <Typography
                            variant="h4"
                            style={{
                                fontSize: '0.85rem',
                                letterSpacing: '0.5px',
                                cursor: 'pointer'
                            }}
                            onDoubleClick={handleDoubleClick}
                            title="Double-click to rename"
                        >
                            {displayTitle}
                        </Typography>
                    )}
                    {/* Count badge */}
                    <span
                        style={{
                            background: config.color === '#999' ? '#eee' : config.color,
                            color: config.color === '#FFF000' ? '#111' : '#fff',
                            padding: '2px 8px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            fontFamily: 'Oswald, sans-serif',
                            border: '1px solid #111'
                        }}
                    >
                        {taskCount}
                    </span>
                </div>

                {/* Drop indicator when dragging */}
                {isDragOver && (
                    <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        fontFamily: 'Oswald, sans-serif',
                        color: '#111',
                        animation: 'pulse 1s infinite'
                    }}>
                        DROP HERE ↓
                    </span>
                )}
            </div>

            {/* Cards Container */}
            <div
                style={{
                    flex: 1,
                    padding: '0.75rem',
                    overflowY: 'auto',
                    minHeight: '200px',
                    background: isDragOver ? 'rgba(255, 240, 0, 0.08)' : undefined,
                    transition: 'background 0.2s ease'
                }}
            >
                {/* Drop zone placeholder when empty and dragging */}
                {tasks.length === 0 && isDragOver && (
                    <div style={{
                        padding: '2rem 1rem',
                        border: '2px dashed #FFF000',
                        background: 'rgba(255, 240, 0, 0.15)',
                        textAlign: 'center',
                        marginBottom: '0.75rem'
                    }}>
                        <Typography variant="body2" style={{ color: '#666' }}>
                            Drop prospect here
                        </Typography>
                    </div>
                )}

                {tasks.map((task) => {
                    const contact = contacts.find(c => c.id === task.contactId);
                    return (
                        <KanbanCard
                            key={task.id}
                            task={task}
                            contactFamiliarity={contact?.familiarity}
                            onDragStart={onDragStart}
                            onDescriptionChange={onDescriptionChange}
                            onDeleteTask={onDeleteTask}
                        />
                    );
                })}
            </div>

            {/* Keyframe animation for pulse effect */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
};

export default KanbanColumn;

