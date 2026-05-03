import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DECKS_DIR = path.join(__dirname, 'decks');

if (!fs.existsSync(DECKS_DIR)) {
    fs.mkdirSync(DECKS_DIR, { recursive: true });
}

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

function readDeck(id) {
    const file = path.join(DECKS_DIR, `${id}.json`);
    if (!fs.existsSync(file)) return null;
    try {
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
    } catch {
        return null;
    }
}

function writeDeck(deck) {
    fs.writeFileSync(path.join(DECKS_DIR, `${deck.id}.json`), JSON.stringify(deck, null, 2), 'utf-8');
}

app.get('/api/decks', (req, res) => {
    const files = fs.readdirSync(DECKS_DIR).filter(f => f.endsWith('.json'));
    const decks = files
        .map(f => {
            try {
                const deck = JSON.parse(fs.readFileSync(path.join(DECKS_DIR, f), 'utf-8'));
                return { id: deck.id, name: deck.name, type: deck.type, entryCount: deck.entries.length, createdAt: deck.createdAt };
            } catch {
                return null;
            }
        })
        .filter(Boolean)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.json(decks);
});

app.get('/api/decks/:id', (req, res) => {
    const deck = readDeck(req.params.id);
    if (!deck) return res.status(404).json({ error: 'Deck not found' });
    res.json(deck);
});

app.post('/api/decks', (req, res) => {
    const { name, type } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'name is required' });
    }
    if (!['kanji', 'vocabulary'].includes(type)) {
        return res.status(400).json({ error: 'type must be "kanji" or "vocabulary"' });
    }
    const deck = { id: randomUUID(), name: name.trim(), type, entries: [], createdAt: new Date().toISOString() };
    writeDeck(deck);
    res.status(201).json(deck);
});

app.put('/api/decks/:id', (req, res) => {
    const deck = readDeck(req.params.id);
    if (!deck) return res.status(404).json({ error: 'Deck not found' });
    const { name, entries } = req.body;
    if (name !== undefined) {
        if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ error: 'name must be a non-empty string' });
        deck.name = name.trim();
    }
    if (entries !== undefined) {
        if (!Array.isArray(entries)) return res.status(400).json({ error: 'entries must be an array' });
        deck.entries = entries;
    }
    writeDeck(deck);
    res.json(deck);
});

app.delete('/api/decks/:id', (req, res) => {
    const file = path.join(DECKS_DIR, `${req.params.id}.json`);
    if (!fs.existsSync(file)) return res.status(404).json({ error: 'Deck not found' });
    fs.unlinkSync(file);
    res.sendStatus(204);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Deck server listening on port ${PORT}`));
