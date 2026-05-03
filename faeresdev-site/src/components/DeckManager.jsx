import React, { useState, useEffect, useCallback } from "react";
import "./DeckManager.css";
import { listDecks, getDeck, createDeck, updateDeck, deleteDeck } from "../api/decksApi.js";

function emptyKanjiEntry() {
    return { kanji: "", translation: "", kun: "", on: "" };
}

function emptyVocabEntry() {
    return { japanese: "", translation: "" };
}

function DeckList({ decks, selectedId, onSelect, onNewDeck, serverDown }) {
    const kanjiDecks = decks.filter(d => d.type === "kanji");
    const vocabDecks = decks.filter(d => d.type === "vocabulary");

    return (
        <div className="dm-sidebar">
            <div className="dm-sidebar-header">
                <h2 className="dm-sidebar-title">Decks</h2>
                {!serverDown && (
                    <button className="dm-new-button" onClick={onNewDeck} type="button">
                        + New deck
                    </button>
                )}
            </div>

            {serverDown && (
                <p className="dm-server-warning">
                    Server unreachable. Start the deck server to manage decks.
                </p>
            )}

            {!serverDown && decks.length === 0 && (
                <p className="dm-empty-hint">No decks yet. Create one to get started.</p>
            )}

            {kanjiDecks.length > 0 && (
                <div className="dm-group">
                    <span className="dm-group-label">Kanji</span>
                    {kanjiDecks.map(d => (
                        <button
                            key={d.id}
                            className={`dm-deck-item ${selectedId === d.id ? "is-selected" : ""}`}
                            onClick={() => onSelect(d.id)}
                            type="button"
                        >
                            <span className="dm-deck-name">{d.name}</span>
                            <span className="dm-deck-count">{d.entryCount} entries</span>
                        </button>
                    ))}
                </div>
            )}

            {vocabDecks.length > 0 && (
                <div className="dm-group">
                    <span className="dm-group-label">Vocabulary</span>
                    {vocabDecks.map(d => (
                        <button
                            key={d.id}
                            className={`dm-deck-item ${selectedId === d.id ? "is-selected" : ""}`}
                            onClick={() => onSelect(d.id)}
                            type="button"
                        >
                            <span className="dm-deck-name">{d.name}</span>
                            <span className="dm-deck-count">{d.entryCount} entries</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function KanjiEntryRow({ entry, index, onChange, onRemove }) {
    return (
        <div className="dm-entry-row">
            <input
                className="dm-entry-input dm-entry-kanji"
                value={entry.kanji}
                onChange={e => onChange(index, "kanji", e.target.value)}
                placeholder="漢字"
                aria-label="Kanji"
            />
            <input
                className="dm-entry-input dm-entry-translation"
                value={entry.translation}
                onChange={e => onChange(index, "translation", e.target.value)}
                placeholder="Translation"
                aria-label="Translation"
            />
            <input
                className="dm-entry-input dm-entry-reading"
                value={entry.kun}
                onChange={e => onChange(index, "kun", e.target.value)}
                placeholder="くん"
                aria-label="Kun reading"
            />
            <input
                className="dm-entry-input dm-entry-reading"
                value={entry.on}
                onChange={e => onChange(index, "on", e.target.value)}
                placeholder="おん"
                aria-label="On reading"
            />
            <button className="dm-entry-remove" onClick={() => onRemove(index)} type="button" aria-label="Remove entry">
                ×
            </button>
        </div>
    );
}

function VocabEntryRow({ entry, index, onChange, onRemove }) {
    return (
        <div className="dm-entry-row">
            <input
                className="dm-entry-input dm-entry-japanese"
                value={entry.japanese}
                onChange={e => onChange(index, "japanese", e.target.value)}
                placeholder="日本語"
                aria-label="Japanese"
            />
            <input
                className="dm-entry-input dm-entry-translation"
                value={entry.translation}
                onChange={e => onChange(index, "translation", e.target.value)}
                placeholder="Translation"
                aria-label="Translation"
            />
            <button className="dm-entry-remove" onClick={() => onRemove(index)} type="button" aria-label="Remove entry">
                ×
            </button>
        </div>
    );
}

function DeckEditor({ deck, onSaved, onDeleted }) {
    const [name, setName] = useState(deck.name);
    const [editingName, setEditingName] = useState(false);
    const [entries, setEntries] = useState(deck.entries.map(e => ({ ...e })));
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        setName(deck.name);
        setEntries(deck.entries.map(e => ({ ...e })));
        setEditingName(false);
        setFeedback(null);
    }, [deck.id]);

    const handleSaveName = async () => {
        if (!name.trim() || name.trim() === deck.name) {
            setEditingName(false);
            setName(deck.name);
            return;
        }
        try {
            const updated = await updateDeck(deck.id, { name: name.trim() });
            onSaved(updated);
            setEditingName(false);
        } catch {
            setFeedback({ type: "error", text: "Failed to rename deck." });
        }
    };

    const handleEntryChange = (index, field, value) => {
        setEntries(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
    };

    const handleAddEntry = () => {
        setEntries(prev => [...prev, deck.type === "kanji" ? emptyKanjiEntry() : emptyVocabEntry()]);
    };

    const handleRemoveEntry = (index) => {
        setEntries(prev => prev.filter((_, i) => i !== index));
    };

    const handleSaveEntries = async () => {
        setSaving(true);
        setFeedback(null);
        try {
            const updated = await updateDeck(deck.id, { entries });
            onSaved(updated);
            setFeedback({ type: "success", text: "Saved." });
        } catch {
            setFeedback({ type: "error", text: "Failed to save entries." });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Delete deck "${deck.name}"? This cannot be undone.`)) return;
        try {
            await deleteDeck(deck.id);
            onDeleted(deck.id);
        } catch {
            setFeedback({ type: "error", text: "Failed to delete deck." });
        }
    };

    const isKanji = deck.type === "kanji";

    return (
        <div className="dm-editor">
            <div className="dm-editor-header">
                {editingName ? (
                    <div className="dm-name-edit">
                        <input
                            className="dm-name-input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") { setEditingName(false); setName(deck.name); } }}
                            autoFocus
                        />
                        <button className="dm-btn dm-btn-primary" onClick={handleSaveName} type="button">Save</button>
                        <button className="dm-btn" onClick={() => { setEditingName(false); setName(deck.name); }} type="button">Cancel</button>
                    </div>
                ) : (
                    <div className="dm-name-display">
                        <h2 className="dm-editor-title">{deck.name}</h2>
                        <span className={`dm-type-badge dm-type-${deck.type}`}>{deck.type}</span>
                        <button className="dm-btn dm-btn-ghost" onClick={() => setEditingName(true)} type="button">Rename</button>
                    </div>
                )}
                <button className="dm-btn dm-btn-danger" onClick={handleDelete} type="button">Delete deck</button>
            </div>

            <div className="dm-entries-section">
                {isKanji && (
                    <div className="dm-entry-header">
                        <span className="dm-col-label dm-col-kanji">Kanji</span>
                        <span className="dm-col-label dm-col-translation">Translation</span>
                        <span className="dm-col-label dm-col-reading">Kun</span>
                        <span className="dm-col-label dm-col-reading">On</span>
                        <span className="dm-col-spacer" />
                    </div>
                )}
                {!isKanji && (
                    <div className="dm-entry-header">
                        <span className="dm-col-label dm-col-japanese">Japanese</span>
                        <span className="dm-col-label dm-col-translation">Translation</span>
                        <span className="dm-col-spacer" />
                    </div>
                )}

                <div className="dm-entries-list">
                    {entries.map((entry, i) =>
                        isKanji ? (
                            <KanjiEntryRow key={i} entry={entry} index={i} onChange={handleEntryChange} onRemove={handleRemoveEntry} />
                        ) : (
                            <VocabEntryRow key={i} entry={entry} index={i} onChange={handleEntryChange} onRemove={handleRemoveEntry} />
                        )
                    )}
                </div>

                {entries.length === 0 && (
                    <p className="dm-no-entries">No entries yet. Add some below.</p>
                )}

                <div className="dm-entries-actions">
                    <button className="dm-btn dm-btn-ghost" onClick={handleAddEntry} type="button">
                        + Add entry
                    </button>
                    <div className="dm-save-row">
                        {feedback && (
                            <span className={`dm-feedback dm-feedback-${feedback.type}`}>{feedback.text}</span>
                        )}
                        <button
                            className="dm-btn dm-btn-primary"
                            onClick={handleSaveEntries}
                            disabled={saving}
                            type="button"
                        >
                            {saving ? "Saving…" : "Save entries"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function CreateDeckModal({ onConfirm, onCancel }) {
    const [name, setName] = useState("");
    const [type, setType] = useState("kanji");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onConfirm(name.trim(), type);
    };

    return (
        <div className="dm-modal-overlay" onClick={onCancel}>
            <div className="dm-modal" onClick={e => e.stopPropagation()}>
                <h3 className="dm-modal-title">New deck</h3>
                <form onSubmit={handleSubmit}>
                    <label className="dm-field-label">Name</label>
                    <input
                        className="dm-modal-input"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="My deck name"
                        autoFocus
                    />
                    <label className="dm-field-label">Type</label>
                    <div className="dm-type-picker">
                        <button
                            type="button"
                            className={`dm-type-option ${type === "kanji" ? "is-selected" : ""}`}
                            onClick={() => setType("kanji")}
                        >
                            Kanji
                        </button>
                        <button
                            type="button"
                            className={`dm-type-option ${type === "vocabulary" ? "is-selected" : ""}`}
                            onClick={() => setType("vocabulary")}
                        >
                            Vocabulary
                        </button>
                    </div>
                    <div className="dm-modal-actions">
                        <button type="button" className="dm-btn" onClick={onCancel}>Cancel</button>
                        <button type="submit" className="dm-btn dm-btn-primary" disabled={!name.trim()}>Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DeckManager() {
    const [decks, setDecks] = useState([]);
    const [serverDown, setServerDown] = useState(false);
    const [selectedDeck, setSelectedDeck] = useState(null);
    const [showCreate, setShowCreate] = useState(false);

    const loadDecks = useCallback(async () => {
        try {
            const data = await listDecks();
            setDecks(data);
            setServerDown(false);
        } catch {
            setServerDown(true);
        }
    }, []);

    useEffect(() => { loadDecks(); }, [loadDecks]);

    const handleSelect = async (id) => {
        try {
            const deck = await getDeck(id);
            setSelectedDeck(deck);
        } catch {
            // silently ignore
        }
    };

    const handleCreate = async (name, type) => {
        try {
            const deck = await createDeck(name, type);
            await loadDecks();
            setSelectedDeck(deck);
            setShowCreate(false);
        } catch {
            // show error inline next iteration
        }
    };

    const handleSaved = (updatedDeck) => {
        setSelectedDeck(updatedDeck);
        loadDecks();
    };

    const handleDeleted = (id) => {
        if (selectedDeck?.id === id) setSelectedDeck(null);
        loadDecks();
    };

    return (
        <div className="dm-page">
            <div className="dm-copy">
                <h1>Deck Manager</h1>
                <p className="dm-subtitle">
                    Create custom decks of kanji or vocabulary entries. Once saved, you can select a deck in any training module.
                </p>
            </div>

            <div className="dm-shell">
                <DeckList
                    decks={decks}
                    selectedId={selectedDeck?.id}
                    onSelect={handleSelect}
                    onNewDeck={() => setShowCreate(true)}
                    serverDown={serverDown}
                />

                <div className="dm-main">
                    {selectedDeck ? (
                        <DeckEditor
                            key={selectedDeck.id}
                            deck={selectedDeck}
                            onSaved={handleSaved}
                            onDeleted={handleDeleted}
                        />
                    ) : (
                        <div className="dm-placeholder">
                            {!serverDown && <p>Select a deck on the left, or create a new one.</p>}
                        </div>
                    )}
                </div>
            </div>

            {showCreate && (
                <CreateDeckModal
                    onConfirm={handleCreate}
                    onCancel={() => setShowCreate(false)}
                />
            )}
        </div>
    );
}

export default DeckManager;
