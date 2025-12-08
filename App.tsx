import React, { useState, useRef } from 'react';
import { initialContacts } from './data/initialContacts';
import { Contact, PrioritizationResult, Priority } from './types';
import ContactList from './components/ContactList';
import DetailPanel from './components/DetailPanel';
import { prioritizeContacts } from './services/geminiService';
import { Navbar, Card, Button, Modal, Input, Loader, useToast, Typography } from '@welovejeff/movers-react';

const App: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>(initialContacts);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Toast hook
    const { toast, ToastContainer } = useToast();

    // Import Modal State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [importCategory, setImportCategory] = useState("");

    // Prioritization State
    const [strategy, setStrategy] = useState("Target VPs of Marketing in Fashion/Retail companies. Ignore companies smaller than 50 employees or with 'Remove' tags.");
    const [isPrioritizing, setIsPrioritizing] = useState(false);

    const selectedContact = contacts.find(c => c.id === selectedId) || null;

    const handleRunPrioritization = async () => {
        setIsPrioritizing(true);
        try {
            const results: PrioritizationResult[] = await prioritizeContacts(contacts, strategy);

            setContacts(prevContacts => prevContacts.map(c => {
                const res = results.find(r => r.id === c.id);
                if (res) {
                    return { ...c, priority: res.priority, priorityReasoning: res.reasoning };
                }
                return c;
            }));

            toast.success('Prioritization complete!');
        } catch (error) {
            toast.error('Prioritization failed. Check your API Key.');
            console.error(error);
        } finally {
            setIsPrioritizing(false);
        }
    };

    const handleUpdateContact = (updated: Contact) => {
        setContacts(contacts.map(c => c.id === updated.id ? updated : c));
    };

    const parseCSV = (text: string, category: string): Contact[] => {
        const rows: string[][] = [];
        let currentRow: string[] = [];
        let currentField = '';
        let inQuote = false;

        const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        for (let i = 0; i < cleanText.length; i++) {
            const char = cleanText[i];
            const nextChar = cleanText[i + 1];

            if (char === '"') {
                if (inQuote && nextChar === '"') {
                    currentField += '"';
                    i++;
                } else {
                    inQuote = !inQuote;
                }
            } else if (char === ',' && !inQuote) {
                currentRow.push(currentField);
                currentField = '';
            } else if (char === '\n' && !inQuote) {
                currentRow.push(currentField);
                rows.push(currentRow);
                currentRow = [];
                currentField = '';
            } else {
                currentField += char;
            }
        }
        if (currentField || currentRow.length > 0) {
            currentRow.push(currentField);
            rows.push(currentRow);
        }

        if (rows.length < 2) return [];

        const headers = rows[0].map(h => h.trim().toLowerCase());
        const contacts: Contact[] = [];

        const getIndex = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h.includes(k)));

        const idxFirstName = getIndex(['first name', 'firstname']);
        const idxLastName = getIndex(['last name', 'lastname']);
        const idxCompany = getIndex(['company']);
        const idxPosition = getIndex(['position', 'title', 'role']);
        const idxLocation = getIndex(['location', 'city']);
        const idxLinkedIn = getIndex(['linkedin', 'url', 'profile']);
        const idxFamiliarity = getIndex(['familiarity']);
        const idxComments = getIndex(['comment', 'notes']);

        const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length < 2) continue;

            if ((!idxFirstName || !row[idxFirstName]) && (!idxCompany || !row[idxCompany])) continue;

            contacts.push({
                id: generateId(),
                firstName: idxFirstName > -1 ? row[idxFirstName] : '',
                lastName: idxLastName > -1 ? row[idxLastName] : '',
                company: idxCompany > -1 ? row[idxCompany] : '',
                position: idxPosition > -1 ? row[idxPosition] : '',
                location: idxLocation > -1 ? row[idxLocation] : '',
                linkedInUrl: idxLinkedIn > -1 ? row[idxLinkedIn] : '',
                familiarity: idxFamiliarity > -1 ? row[idxFamiliarity] : 'Unfamiliar',
                comments: idxComments > -1 ? row[idxComments] : '',
                category: category,
                priority: Priority.Unprocessed
            });
        }

        return contacts;
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setPendingFile(file);
        event.target.value = '';
    };

    const handleConfirmImport = () => {
        if (!pendingFile) return;
        if (!importCategory.trim()) {
            toast.warning('Please enter a category name.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            try {
                const newContacts = parseCSV(text, importCategory.trim());
                if (newContacts.length > 0) {
                    setContacts(prev => [...prev, ...newContacts]);
                    setIsImportModalOpen(false);
                    setPendingFile(null);
                    toast.success(`Imported ${newContacts.length} contacts!`);
                } else {
                    toast.error('Could not parse contacts from CSV.');
                }
            } catch (err) {
                console.error(err);
                toast.error('Error parsing CSV.');
            }
        };
        reader.readAsText(pendingFile);
    };

    const handleCancelImport = () => {
        setIsImportModalOpen(false);
        setPendingFile(null);
        setImportCategory("");
    };

    const handleOpenImportModal = () => {
        setPendingFile(null);
        setImportCategory("");
        setIsImportModalOpen(true);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.name.endsWith('.csv')) {
            setPendingFile(file);
        } else {
            toast.warning('Please drop a CSV file.');
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const navItems = [
        { id: 'contacts', label: `${contacts.length} Contacts`, href: '#' }
    ];

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f5f5f5', overflow: 'hidden' }}>

            {/* Hidden File Input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept=".csv"
            />

            {/* Import Modal */}
            <Modal
                open={isImportModalOpen}
                onClose={handleCancelImport}
                title="IMPORT CONTACTS"
            >
                <div style={{ marginBottom: '1.5rem' }}>
                    {/* File Upload Zone */}
                    {!pendingFile ? (
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            style={{
                                padding: '2rem',
                                background: '#f5f5f5',
                                border: '3px dashed #111',
                                marginBottom: '1rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📄</div>
                            <Typography variant="h4" style={{ marginBottom: '0.5rem' }}>
                                DROP CSV HERE
                            </Typography>
                            <Typography variant="body1" style={{ color: '#666' }}>
                                or click to browse files
                            </Typography>
                        </div>
                    ) : (
                        <div style={{
                            padding: '1rem',
                            background: '#FFF000',
                            border: '2px solid #111',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.75rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>✅</span>
                                <div>
                                    <Typography variant="body1" style={{ fontWeight: 600 }}>{pendingFile.name}</Typography>
                                    <Typography variant="caption" style={{ color: '#333' }}>
                                        {(pendingFile.size / 1024).toFixed(1)} KB
                                    </Typography>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="small"
                                onClick={(e) => { e.stopPropagation(); setPendingFile(null); }}
                            >
                                ✕
                            </Button>
                        </div>
                    )}

                    <Typography variant="overline" style={{ marginBottom: '0.5rem', display: 'block' }}>
                        Category / List Tag
                    </Typography>
                    <Input
                        value={importCategory}
                        onChange={(e) => setImportCategory(e.target.value)}
                        placeholder="Enter category name..."
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <Button variant="ghost" onClick={handleCancelImport}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleConfirmImport}
                        disabled={!pendingFile}
                    >
                        Import Contacts
                    </Button>
                </div>
            </Modal>

            {/* Navbar */}
            <Navbar
                logo="MOVERS+SHAKERS CRM"
                items={navItems}
            />

            {/* Main Layout */}
            <main style={{
                flex: 1,
                display: 'flex',
                maxWidth: '1400px',
                margin: '0 auto',
                width: '100%',
                padding: '1.5rem',
                gap: '1.5rem',
                overflow: 'hidden'
            }}>

                {/* Left Sidebar: List & Strategy */}
                <aside style={{ width: '420px', display: 'flex', flexDirection: 'column', gap: '1.5rem', flexShrink: 0, overflow: 'hidden' }}>

                    {/* Strategy Card */}
                    <Card>
                        <Typography variant="h3" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ width: '10px', height: '10px', background: '#FFF000', border: '2px solid #111' }}></span>
                            STRATEGY ENGINE
                        </Typography>
                        <textarea
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #111',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '0.875rem',
                                resize: 'none',
                                marginBottom: '1rem',
                                minHeight: '80px'
                            }}
                            value={strategy}
                            onChange={(e) => setStrategy(e.target.value)}
                            placeholder="Define who to target..."
                        />
                        <Button
                            variant="primary"
                            onClick={handleRunPrioritization}
                            disabled={isPrioritizing}
                            style={{ width: '100%' }}
                        >
                            {isPrioritizing ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Loader size="small" /> Analyzing...
                                </span>
                            ) : '⚗️ Run Prioritization'}
                        </Button>
                    </Card>

                    {/* Contacts List */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <Typography variant="h4">PROSPECTS</Typography>
                            <Button
                                variant="outline"
                                onClick={handleOpenImportModal}
                                size="small"
                            >
                                + Add CSV
                            </Button>
                        </div>
                        <ContactList
                            contacts={contacts}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                        />
                    </div>
                </aside>

                {/* Right Content: Detail Panel */}
                <section style={{ flex: 1, minWidth: 0 }}>
                    {selectedContact ? (
                        <DetailPanel
                            contact={selectedContact}
                            onUpdateContact={handleUpdateContact}
                        />
                    ) : (
                        <Card style={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderStyle: 'dashed'
                        }}>
                            <Typography variant="h2" style={{ marginBottom: '0.5rem', opacity: 0.3 }}>👥</Typography>
                            <Typography variant="body1" style={{ color: '#666' }}>
                                Select a contact to begin research
                            </Typography>
                        </Card>
                    )}
                </section>

            </main>

            {/* Toast Container */}
            <ToastContainer />
        </div>
    );
};

export default App;