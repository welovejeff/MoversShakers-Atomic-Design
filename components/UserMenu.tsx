import React, { useState, useRef, useEffect } from 'react';
import { Button, Typography } from '@welovejeff/movers-react';

interface UserMenuProps {
    onCleanup: () => void;
    userEmail?: string;
    onLogout: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ onCleanup, userEmail = "Guest", onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={menuRef} style={{ position: 'relative' }}>
            {/* Avatar Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#FFF000',
                    border: '2px solid #000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    boxShadow: isOpen ? '2px 2px 0px #000' : 'none',
                    transform: isOpen ? 'translate(2px, 2px)' : 'none',
                    transition: 'all 0.1s ease',
                    zIndex: 200
                }}
            >
                <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail}`}
                    alt="User"
                    style={{ width: '100%', height: '100%' }}
                />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '220px',
                    backgroundColor: '#fff',
                    border: '3px solid #000',
                    boxShadow: '4px 4px 0px #000',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '0.5rem',
                    gap: '0.5rem'
                }}>
                    {/* User Info Header */}
                    <div style={{
                        padding: '0.5rem',
                        borderBottom: '2px solid #eee',
                        marginBottom: '0.25rem'
                    }}>
                        <Typography variant="body2" style={{ fontWeight: 'bold' }}>LOGGED IN AS</Typography>
                        <Typography variant="caption" style={{ color: '#666' }}>{userEmail}</Typography>
                    </div>

                    {/* Actions */}
                    <Button
                        variant="ghost"
                        onClick={() => {
                            onCleanup();
                            setIsOpen(false);
                        }}
                        size="small"
                        style={{
                            justifyContent: 'flex-start',
                            color: '#F00',
                            borderColor: '#F00'
                        }}
                    >
                        🧹 Clean Duplicates
                    </Button>

                    <Button
                        variant="ghost"
                        onClick={() => {
                            onLogout();
                            setIsOpen(false);
                        }}
                        size="small"
                        style={{ justifyContent: 'flex-start' }}
                    >
                        🚪 Log Out
                    </Button>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
