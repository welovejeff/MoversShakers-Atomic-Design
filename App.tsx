import React, { useState, useRef, useEffect } from 'react';
import { initialContacts } from './data/initialContacts';
import { Contact, PrioritizationResult, Priority, OutreachTask, OutreachStatus } from './types';
import ContactList from './components/ContactList';
import DetailPanel from './components/DetailPanel';
import KanbanBoard from './components/KanbanBoard';
import PillSlider from './components/PillSlider';
import { prioritizeContacts } from './services/geminiService';
import { contactsService, tasksService, settingsService } from './services/firestoreService';
import { Navbar, Card, Button, Modal, Input, Loader, useToast, Typography } from '@welovejeff/movers-react';

const App: React.FC = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Toast hook
    const { toast, ToastContainer } = useToast();

    // Import Modal State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    // Prospecting Assistant Modal State
    const [isProspectingModalOpen, setIsProspectingModalOpen] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [importCategory, setImportCategory] = useState("");

    // Prioritization State
    const [strategy, setStrategy] = useState("Target VPs of Marketing in Fashion/Retail companies. Ignore companies smaller than 50 employees or with 'Remove' tags.");
    const [isPrioritizing, setIsPrioritizing] = useState(false);

    // Filter State
    const [filterOpen, setFilterOpen] = useState(false);
    const [activeFilter, setActiveFilter] = useState<string>('all');

    // View Toggle State
    const [activeView, setActiveView] = useState<'Contact View' | 'Kanban Board'>('Contact View');

    // Kanban Tasks State
    const [outreachTasks, setOutreachTasks] = useState<OutreachTask[]>([]);

    // Kanban Column Names
    const [columnNames, setColumnNames] = useState<Record<OutreachStatus, string>>({
        [OutreachStatus.Queued]: 'QUEUED',
        [OutreachStatus.Sent]: 'SENT / AWAITING',
        [OutreachStatus.Followup]: 'FOLLOW UP'
    });

    // Load contacts from Firestore on mount
    useEffect(() => {
        loadContacts();
    }, []);

    const loadContacts = async () => {
        try {
            // Load contacts
            const firestoreContacts = await contactsService.getAll();
            if (firestoreContacts.length > 0) {
                setContacts(firestoreContacts);
            } else {
                // Seed with initial contacts if Firestore is empty
                const contactsToSeed = initialContacts.map(({ id, ...rest }) => rest);
                const seeded = await contactsService.bulkCreate(contactsToSeed);
                setContacts(seeded);
                toast.success('Initialized contacts database');
            }

            // Load outreach tasks from Firestore
            const firestoreTasks = await tasksService.getAll();
            setOutreachTasks(firestoreTasks);

            // Load column names from Firestore
            const savedColumnNames = await settingsService.getColumnNames();
            if (savedColumnNames) {
                setColumnNames(savedColumnNames);
            }
        } catch (error) {
            console.error('Failed to load contacts:', error);
            toast.error('Failed to load contacts from database');
            // Fall back to initial contacts
            setContacts(initialContacts);
        } finally {
            setIsLoading(false);
        }
    };

    const selectedContact = contacts.find(c => c.id === selectedId) || null;

    // Get unique categories from contacts
    const categories = [...new Set(contacts.map(c => c.category).filter(Boolean))];

    // Filter contacts based on active filter
    const filteredContacts = contacts.filter(contact => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'high') return contact.priority === Priority.High;
        if (activeFilter === 'medium') return contact.priority === Priority.Medium;
        if (activeFilter === 'low') return contact.priority === Priority.Low;
        if (activeFilter === 'unprocessed') return contact.priority === Priority.Unprocessed;
        // Category filters
        return contact.category === activeFilter;
    });

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

    const handleUpdateContact = async (updated: Contact) => {
        setContacts(prev => prev.map(c => c.id === updated.id ? updated : c));
        // Sync to Firestore
        try {
            await contactsService.update(updated.id, updated);
        } catch (error) {
            console.error('Failed to update contact in Firestore:', error);
            toast.error('Failed to save contact update');
        }
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

    const handleConfirmImport = async () => {
        if (!pendingFile) return;
        if (!importCategory.trim()) {
            toast.warning('Please enter a category name.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            try {
                const parsedContacts = parseCSV(text, importCategory.trim());
                if (parsedContacts.length > 0) {
                    // Persist to Firestore first
                    const contactsToCreate = parsedContacts.map(({ id, ...rest }) => rest);
                    const createdContacts = await contactsService.bulkCreate(contactsToCreate);
                    setContacts(prev => [...prev, ...createdContacts]);
                    setIsImportModalOpen(false);
                    setPendingFile(null);
                    setImportCategory('');
                    toast.success(`Imported ${createdContacts.length} contacts!`);
                } else {
                    toast.error('Could not parse contacts from CSV.');
                }
            } catch (err) {
                console.error(err);
                toast.error('Error importing contacts.');
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

    // Kanban Handlers
    const handleTaskMove = async (taskId: string, newStatus: OutreachStatus) => {
        setOutreachTasks(prev => prev.map(task =>
            task.id === taskId ? { ...task, status: newStatus } : task
        ));
        // Persist to Firestore
        try {
            await tasksService.updateStatus(taskId, newStatus);
        } catch (error) {
            console.error('Failed to save task move:', error);
            toast.error('Failed to save task position');
        }
    };

    const handleDropProspect = async (e: React.DragEvent, status: OutreachStatus) => {
        const contactId = e.dataTransfer.getData('contactId');
        const contactName = e.dataTransfer.getData('contactName');
        const contactCompany = e.dataTransfer.getData('contactCompany');
        const contactPriority = e.dataTransfer.getData('contactPriority');

        if (!contactId) {
            return;
        }

        // Check if task already exists for this contact
        const exists = outreachTasks.some(t => t.contactId === contactId);
        if (exists) {
            toast.warning('Task already exists for this contact');
            return;
        }

        const taskData = {
            contactId,
            title: contactName || 'Outreach Task',
            description: contactCompany ? `Reach out to ${contactCompany}` : undefined,
            priority: (contactPriority === 'High' ? 'HIGH' : contactPriority === 'Low' ? 'LOW' : 'MEDIUM') as 'HIGH' | 'MEDIUM' | 'LOW',
            status,
            tags: ['Outreach'],
            assignees: ['JD']
        };

        try {
            // Create in Firestore and get the persisted task with ID
            const createdTask = await tasksService.create(taskData);
            setOutreachTasks(prev => [...prev, createdTask]);
            toast.success(`Added task for ${contactName}`);
        } catch (error) {
            console.error('Failed to create task:', error);
            toast.error('Failed to create task');
        }
    };

    const handleAddTask = (status: OutreachStatus) => {
        // For now, just show a toast - could open a modal for full task creation
        toast.info('Select a prospect from the list and drag it here');
    };

    const handleRenameColumn = async (status: OutreachStatus, newName: string) => {
        setColumnNames(prev => ({
            ...prev,
            [status]: newName
        }));

        // Persist to Firestore
        try {
            await settingsService.updateColumnName(status, newName);
            toast.success(`Column renamed to "${newName}"`);
        } catch (error) {
            console.error('Failed to save column name:', error);
            toast.error('Failed to save column name');
        }
    };

    const handleDescriptionChange = async (taskId: string, newDescription: string) => {
        setOutreachTasks(prev => prev.map(task =>
            task.id === taskId ? { ...task, description: newDescription } : task
        ));
        // Persist to Firestore
        try {
            await tasksService.update(taskId, { description: newDescription });
        } catch (error) {
            console.error('Failed to save task description:', error);
            toast.error('Failed to save description');
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        setOutreachTasks(prev => prev.filter(task => task.id !== taskId));
        // Delete from Firestore
        try {
            await tasksService.delete(taskId);
            toast.success('Task deleted');
        } catch (error) {
            console.error('Failed to delete task:', error);
            toast.error('Failed to delete task');
        }
    };

    // Update a contact's familiarity status from the Kanban card
    const handleFamiliarityChange = async (contactId: string, newFamiliarity: string) => {
        // Update local state
        setContacts(prev => prev.map(contact =>
            contact.id === contactId ? { ...contact, familiarity: newFamiliarity } : contact
        ));
        // Persist to Firestore
        try {
            await contactsService.update(contactId, { familiarity: newFamiliarity });
        } catch (error) {
            console.error('Failed to save familiarity:', error);
            toast.error('Failed to save status');
        }
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

            {/* Prospecting Assistant Modal */}
            <Modal
                open={isProspectingModalOpen}
                onClose={() => setIsProspectingModalOpen(false)}
                title="🎯 PROSPECTING ASSISTANT"
            >
                <div style={{ marginBottom: '1rem' }}>
                    <Typography variant="body2" style={{ color: '#666', marginBottom: '1rem' }}>
                        Describe your ideal target prospects and AI will prioritize your contact list.
                    </Typography>
                    <textarea
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '2px solid #111',
                            fontFamily: 'Inter, sans-serif',
                            fontSize: '0.875rem',
                            resize: 'none',
                            minHeight: '100px'
                        }}
                        value={strategy}
                        onChange={(e) => setStrategy(e.target.value)}
                        placeholder="e.g., Target VPs of Marketing in Fashion/Retail companies. Prioritize companies with 50+ employees..."
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                    <Button variant="ghost" onClick={() => setIsProspectingModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => {
                            handleRunPrioritization();
                            setIsProspectingModalOpen(false);
                        }}
                        disabled={isPrioritizing}
                    >
                        {isPrioritizing ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Loader size="small" /> Analyzing...
                            </span>
                        ) : '⚗️ Run Prioritization'}
                    </Button>
                </div>
            </Modal>

            {/* Navbar with View Toggle */}
            <div style={{ position: 'relative' }}>
                <Navbar
                    logo="MOVERS+SHAKERS CRM"
                    items={navItems}
                />
                <div style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 100
                }}>
                    <PillSlider
                        options={['Contact View', 'Kanban Board']}
                        value={activeView}
                        onChange={(v) => setActiveView(v as 'Contact View' | 'Kanban Board')}
                    />
                </div>
            </div>

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

                {/* Left Sidebar: List */}
                <aside style={{ width: '420px', display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0, overflow: 'hidden' }}>

                    {/* Contacts List */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <Typography variant="h4">PROSPECTS</Typography>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                {/* Filter Dropdown */}
                                <div style={{ position: 'relative' }}>
                                    <Button
                                        variant="ghost"
                                        size="small"
                                        onClick={() => setFilterOpen(!filterOpen)}
                                    >
                                        🔍 {activeFilter === 'all' ? 'Filter' : activeFilter} ▾
                                    </Button>
                                    {filterOpen && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            right: 0,
                                            marginTop: '0.25rem',
                                            background: '#fff',
                                            border: '2px solid #111',
                                            boxShadow: '3px 3px 0 #111',
                                            zIndex: 100,
                                            minWidth: '140px'
                                        }}>
                                            <div
                                                onClick={() => { setActiveFilter('all'); setFilterOpen(false); }}
                                                style={{
                                                    padding: '0.5rem 0.75rem',
                                                    cursor: 'pointer',
                                                    background: activeFilter === 'all' ? '#FFF000' : '#fff',
                                                    fontWeight: activeFilter === 'all' ? 600 : 400,
                                                    fontSize: '0.875rem',
                                                    borderBottom: '1px solid #eee'
                                                }}
                                            >
                                                All Contacts
                                            </div>
                                            <div style={{ padding: '0.25rem 0.75rem', fontSize: '0.7rem', color: '#666', background: '#f9f9f9', fontWeight: 600 }}>PRIORITY</div>
                                            {['high', 'medium', 'low', 'unprocessed'].map(p => (
                                                <div
                                                    key={p}
                                                    onClick={() => { setActiveFilter(p); setFilterOpen(false); }}
                                                    style={{
                                                        padding: '0.5rem 0.75rem',
                                                        cursor: 'pointer',
                                                        background: activeFilter === p ? '#FFF000' : '#fff',
                                                        fontWeight: activeFilter === p ? 600 : 400,
                                                        fontSize: '0.875rem',
                                                        borderBottom: '1px solid #eee'
                                                    }}
                                                >
                                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                                </div>
                                            ))}
                                            {categories.length > 0 && (
                                                <>
                                                    <div style={{ padding: '0.25rem 0.75rem', fontSize: '0.7rem', color: '#666', background: '#f9f9f9', fontWeight: 600 }}>CATEGORY</div>
                                                    {categories.map(cat => (
                                                        <div
                                                            key={cat}
                                                            onClick={() => { setActiveFilter(cat!); setFilterOpen(false); }}
                                                            style={{
                                                                padding: '0.5rem 0.75rem',
                                                                cursor: 'pointer',
                                                                background: activeFilter === cat ? '#FFF000' : '#fff',
                                                                fontWeight: activeFilter === cat ? 600 : 400,
                                                                fontSize: '0.875rem',
                                                                borderBottom: '1px solid #eee'
                                                            }}
                                                        >
                                                            {cat}
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handleOpenImportModal}
                                    size="small"
                                >
                                    + Add CSV
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={() => setIsProspectingModalOpen(true)}
                                    size="small"
                                >
                                    {isPrioritizing ? '⏳' : '🎯'} AI Assist
                                </Button>
                            </div>
                        </div>
                        {isLoading ? (
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem'
                            }}>
                                <Loader size="large" />
                                <Typography variant="body2" style={{ color: '#666' }}>
                                    Loading contacts...
                                </Typography>
                            </div>
                        ) : (
                            <ContactList
                                contacts={filteredContacts}
                                selectedId={selectedId}
                                onSelect={setSelectedId}
                                kanbanMode={activeView === 'Kanban Board'}
                                outreachTasks={outreachTasks}
                                columnNames={columnNames}
                            />
                        )}
                    </div>
                </aside>

                {/* Right Content: Detail Panel or Kanban Board */}
                <section style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    {activeView === 'Kanban Board' ? (
                        <KanbanBoard
                            tasks={outreachTasks}
                            contacts={contacts}
                            columnNames={columnNames}
                            onTaskMove={handleTaskMove}
                            onRenameColumn={handleRenameColumn}
                            onDropProspect={handleDropProspect}
                            onDescriptionChange={handleDescriptionChange}
                            onDeleteTask={handleDeleteTask}
                        />
                    ) : selectedContact ? (
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