import React from 'react';
import { Contact, Priority } from '../types';
import { Card, Badge, Typography } from '@welovejeff/movers-react';

interface ContactListProps {
  contacts: Contact[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const ContactList: React.FC<ContactListProps> = ({ contacts, selectedId, onSelect }) => {

  const getPriorityVariant = (p: Priority): 'success' | 'warning' | 'info' | 'error' | undefined => {
    switch (p) {
      case Priority.High: return 'success';
      case Priority.Medium: return 'warning';
      case Priority.Low: return 'info';
      case Priority.Ignore: return 'error';
      default: return undefined;
    }
  };

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {contacts.map((contact) => (
          <Card
            key={contact.id}
            hoverable
            onClick={() => onSelect(contact.id)}
            style={{
              cursor: 'pointer',
              background: selectedId === contact.id ? '#FFF000' : '#fff',
              transform: selectedId === contact.id ? 'translate(-2px, -2px)' : undefined,
              boxShadow: selectedId === contact.id ? '4px 4px 0 #111' : undefined
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
                    <Badge variant={getPriorityVariant(contact.priority)}>
                      {contact.priority}
                    </Badge>
                  </div>
                </div>

                <Typography variant="body1" style={{ fontWeight: 500, margin: '0.25rem 0' }}>
                  {contact.company}
                </Typography>
                <Typography variant="caption" style={{ color: '#666', margin: 0 }}>
                  {contact.position}
                </Typography>

                {contact.comments ? (
                  <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    <Badge size="small" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      📝 {contact.comments}
                    </Badge>
                  </div>
                ) : null}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContactList;