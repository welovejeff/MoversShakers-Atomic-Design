import React, { useState } from 'react';
import { Contact, Priority, OutreachTask, OutreachStatus } from '../types';
import { Card, Badge, Typography } from '@welovejeff/movers-react';

interface ContactListProps {
  contacts: Contact[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  kanbanMode?: boolean;
  outreachTasks?: OutreachTask[];
  columnNames?: Record<OutreachStatus, string>;
}

const defaultColumnNames: Record<OutreachStatus, string> = {
  [OutreachStatus.Queued]: 'QUEUED',
  [OutreachStatus.Sent]: 'SENT / AWAITING',
  [OutreachStatus.Followup]: 'FOLLOW UP',
};

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  selectedId,
  onSelect,
  kanbanMode = false,
  outreachTasks = [],
  columnNames = defaultColumnNames
}) => {

  const getOutreachInfo = (contactId: string): { status: OutreachStatus; columnName: string } | null => {
    const task = outreachTasks.find(t => t.contactId === contactId);
    if (!task) return null;
    return {
      status: task.status,
      columnName: columnNames[task.status] || task.status
    };
  };

  const getPriorityVariant = (p: Priority): 'success' | 'warning' | 'info' | 'error' | undefined => {
    switch (p) {
      case Priority.High: return 'success';
      case Priority.Medium: return 'warning';
      case Priority.Low: return 'info';
      case Priority.Ignore: return 'error';
      case Priority.Unprocessed: return undefined;
      default: return undefined;
    }
  };

  const getPriorityLabel = (p: Priority): string => {
    switch (p) {
      case Priority.High: return '🔥 High';
      case Priority.Medium: return '→ Medium';
      case Priority.Low: return '↓ Low';
      case Priority.Ignore: return '✕ Skip';
      case Priority.Unprocessed: return '✨ New';
      default: return p;
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {contacts.map((contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            isSelected={selectedId === contact.id}
            onSelect={() => onSelect(contact.id)}
            kanbanMode={kanbanMode}
            outreachInfo={getOutreachInfo(contact.id)}
            getPriorityVariant={getPriorityVariant}
            getPriorityLabel={getPriorityLabel}
          />
        ))}
      </div>
    </div>
  );
};

interface ContactCardProps {
  contact: Contact;
  isSelected: boolean;
  onSelect: () => void;
  kanbanMode: boolean;
  outreachInfo: { status: OutreachStatus; columnName: string } | null;
  getPriorityVariant: (p: Priority) => 'success' | 'warning' | 'info' | 'error' | undefined;
  getPriorityLabel: (p: Priority) => string;
}

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  isSelected,
  onSelect,
  kanbanMode,
  outreachInfo,
  getPriorityVariant,
  getPriorityLabel
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const getStatusIcon = (status: OutreachStatus): string => {
    switch (status) {
      case OutreachStatus.Queued: return '📋';
      case OutreachStatus.Sent: return '📤';
      case OutreachStatus.Followup: return '🔄';
      default: return '📌';
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('contactId', contact.id);
    e.dataTransfer.setData('dragType', 'prospect');
    e.dataTransfer.setData('contactName', `${contact.firstName} ${contact.lastName}`);
    e.dataTransfer.setData('contactCompany', contact.company);
    e.dataTransfer.setData('contactPriority', contact.priority);
    e.dataTransfer.effectAllowed = 'copyMove';

    // Create custom drag image with rotation
    const dragEl = e.currentTarget.cloneNode(true) as HTMLElement;
    dragEl.style.transform = 'rotate(3deg) scale(1.05)';
    dragEl.style.boxShadow = '8px 8px 0 rgba(0,0,0,0.3)';
    dragEl.style.position = 'absolute';
    dragEl.style.top = '-1000px';
    dragEl.style.background = '#FFF000';
    document.body.appendChild(dragEl);
    e.dataTransfer.setDragImage(dragEl, 100, 30);
    setTimeout(() => dragEl.remove(), 0);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Determine cursor and base transform
  const getCursor = () => {
    if (kanbanMode && isDragging) return 'grabbing';
    if (kanbanMode) return 'grab';
    return 'pointer';
  };

  const getTransform = () => {
    if (kanbanMode && isDragging) return 'rotate(2deg) scale(0.98)';
    if (isSelected) return 'translate(-2px, -2px)';
    return undefined;
  };

  const getBoxShadow = () => {
    if (kanbanMode && isDragging) return '6px 6px 0 rgba(0,0,0,0.2)';
    if (isSelected) return '4px 4px 0 #111';
    return undefined;
  };

  return (
    <Card
      hoverable
      draggable={kanbanMode}
      onDragStart={kanbanMode ? handleDragStart : undefined}
      onDragEnd={kanbanMode ? handleDragEnd : undefined}
      onClick={onSelect}
      style={{
        cursor: getCursor(),
        background: isSelected ? '#FFF000' : '#fff',
        transform: getTransform(),
        boxShadow: getBoxShadow(),
        opacity: (kanbanMode && isDragging) ? 0.6 : 1,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
        borderColor: (kanbanMode && isDragging) ? '#FFF000' : undefined
      }}
    >
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        {/* @ts-ignore - Web Component */}
        <ms-avatar
          initials={`${contact.firstName?.[0] || ''}${contact.lastName?.[0] || ''}`}
          size="md"
          style={{ flexShrink: 0 }}
        ></ms-avatar>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
            <Typography variant="h4" style={{ fontSize: '1rem', margin: 0 }}>
              {contact.firstName} {contact.lastName}
            </Typography>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {contact.category && (
                <Badge variant="info">
                  {contact.category}
                </Badge>
              )}
              {/* Show column name if on Kanban board, otherwise show priority */}
              {outreachInfo ? (
                <Badge
                  variant="warning"
                  style={{
                    background: outreachInfo.status === OutreachStatus.Sent ? '#FFF000' :
                      outreachInfo.status === OutreachStatus.Followup ? '#4CAF50' : '#eee',
                    color: outreachInfo.status === OutreachStatus.Followup ? '#fff' : '#111'
                  }}
                >
                  {getStatusIcon(outreachInfo.status)} {outreachInfo.columnName}
                </Badge>
              ) : (
                <Badge variant={getPriorityVariant(contact.priority)}>
                  {getPriorityLabel(contact.priority)}
                </Badge>
              )}
            </div>
          </div>

          <Typography variant="body1" style={{ fontWeight: 500, margin: '0.25rem 0' }}>
            {contact.company}
          </Typography>
          <Typography variant="caption" style={{ color: '#666', margin: 0 }}>
            {contact.position}
          </Typography>

          {/* AI Summary - subtle italicized text */}
          {contact.commentsSummary && (
            <Typography
              variant="caption"
              style={{
                fontStyle: 'italic',
                color: '#777',
                marginTop: '0.5rem',
                display: 'block',
                lineHeight: 1.4,
                maxWidth: '280px'
              }}
            >
              {contact.commentsSummary}
            </Typography>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ContactList;