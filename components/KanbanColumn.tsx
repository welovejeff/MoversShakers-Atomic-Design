import React, { useState } from 'react';
import { OutreachTask, OutreachStatus } from '../types';
import { Typography, Button } from '@welovejeff/movers-react';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
    status: OutreachStatus;
    tasks: OutreachTask[];
    customTitle?: string;
    onDragStart: (e: React.DragEvent, task: OutreachTask) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, status: OutreachStatus) => void;
    onRenameColumn?: (status: OutreachStatus, newName: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
    status,
    tasks,
    customTitle,
    onDragStart,
    onDragOver,
    onDrop,
    onRenameColumn
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
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

    return (
        <div
            style={{
                flex: 1,
                minWidth: '280px',
                maxWidth: '350px',
                display: 'flex',
                flexDirection: 'column',
                background: config.bgColor,
                border: '2px solid #111',
                height: '100%'
            }}
        >
            {/* Column Header */}
            <div
                style={{
                    padding: '1rem',
                    borderBottom: '2px solid #111',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: '#fff'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                        style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: config.color,
                            border: '2px solid #111'
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
            </div>

            {/* Cards Container */}
            <div
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, status)}
                style={{
                    flex: 1,
                    padding: '0.75rem',
                    overflowY: 'auto',
                    minHeight: '200px'
                }}
            >
                {tasks.map((task) => (
                    <KanbanCard
                        key={task.id}
                        task={task}
                        onDragStart={onDragStart}
                    />
                ))}
            </div>
        </div>
    );
};

export default KanbanColumn;
