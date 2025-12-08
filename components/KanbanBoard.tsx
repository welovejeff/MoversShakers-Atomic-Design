import React from 'react';
import { OutreachTask, OutreachStatus } from '../types';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
    tasks: OutreachTask[];
    columnNames: Record<OutreachStatus, string>;
    onTaskMove: (taskId: string, newStatus: OutreachStatus) => void;
    onRenameColumn: (status: OutreachStatus, newName: string) => void;
    onDropProspect?: (e: React.DragEvent, status: OutreachStatus) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
    tasks,
    columnNames,
    onTaskMove,
    onRenameColumn,
    onDropProspect
}) => {
    const columns: OutreachStatus[] = [
        OutreachStatus.Queued,
        OutreachStatus.Sent,
        OutreachStatus.Followup
    ];

    const handleDragStart = (e: React.DragEvent, task: OutreachTask) => {
        e.dataTransfer.setData('taskId', task.id);
        e.dataTransfer.setData('dragType', 'kanbanTask');
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, status: OutreachStatus) => {
        e.preventDefault();

        const dragType = e.dataTransfer.getData('dragType');

        if (dragType === 'kanbanTask') {
            // Moving existing Kanban task
            const taskId = e.dataTransfer.getData('taskId');
            if (taskId) {
                onTaskMove(taskId, status);
            }
        } else if (dragType === 'prospect') {
            // Dropping a prospect from the sidebar
            if (onDropProspect) {
                onDropProspect(e, status);
            }
        }
    };

    const getTasksByStatus = (status: OutreachStatus) => {
        return tasks.filter(task => task.status === status);
    };

    return (
        <div
            style={{
                display: 'flex',
                gap: '1rem',
                height: '100%',
                overflow: 'auto',
                padding: '0.5rem 0'
            }}
        >
            {columns.map((status) => (
                <KanbanColumn
                    key={status}
                    status={status}
                    tasks={getTasksByStatus(status)}
                    customTitle={columnNames[status]}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onRenameColumn={onRenameColumn}
                />
            ))}
        </div>
    );
};

export default KanbanBoard;
