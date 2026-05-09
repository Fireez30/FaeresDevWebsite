import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DECKS_DIR = path.join(__dirname, 'decks');
const ZONES_DIR = path.join(__dirname, 'zones');
const POKEMON_CARDS_DIR = path.join(__dirname, 'pokemon_cards');
const TEAMS_DIR = path.join(__dirname, 'teams');
const POKEMON_DATA_DIR = path.join(__dirname, 'pokemon_data');
const JAPANESE_DATA_DIR = path.join(__dirname, 'japanese');
const KATAKANA_WORDS_FILE = path.join(JAPANESE_DATA_DIR, 'katakana_words.json');
const KATAKANA_SYLLABUS_FILE = path.join(JAPANESE_DATA_DIR, 'katakana.json');
const HIRAGANA_WORDS_FILE = path.join(JAPANESE_DATA_DIR, 'hiragana_words.json');
const HIRAGANA_SYLLABUS_FILE = path.join(JAPANESE_DATA_DIR, 'hiragana.json');


for (const dir of [DECKS_DIR, ZONES_DIR, POKEMON_CARDS_DIR, TEAMS_DIR, JAPANESE_DATA_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
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

// ─── Japanese ────────────────────────────────────────────────────────────────────

function getRandomItemsFromArray(arr, random_count) {
    let output_array = [];
    while (output_array.length < random_count) {
        const picked = arr[Math.floor(Math.random() * arr.length)];
        if (output_array.indexOf(picked) === -1) {
            output_array.push(picked);
        }
    }
    return output_array;
}
app.get('/api/hiragana_words', (req, res) => {
    const {count} = req.query;
    try {
        const hiraganawords = JSON.parse(fs.readFileSync(HIRAGANA_WORDS_FILE, 'utf8'));
        let words = getRandomItemsFromArray(hiraganawords,count);
        return res.json(words);
    }
    catch {
        return null;
    }
});

app.get('/api/katakana_words', (req, res) => {
    const {count} = req.query;
    console.log(count);
    try {
        const katakanawords = JSON.parse(fs.readFileSync(KATAKANA_WORDS_FILE, 'utf8'));
        //console.log(katakanawords);
        let words = getRandomItemsFromArray(katakanawords,count);
        console.log(words);
        return res.json(words);
    }
    catch {
        return null;
    }
});


// ─── Decks ────────────────────────────────────────────────────────────────────

function readDeck(id) {
    const file = path.join(DECKS_DIR, `${id}.json`);
    if (!fs.existsSync(file)) return null;
    try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return null; }
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
            } catch { return null; }
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
    if (!name || typeof name !== 'string' || !name.trim())
        return res.status(400).json({ error: 'name is required' });
    if (!['kanji', 'vocabulary', 'katakana'].includes(type))
        return res.status(400).json({ error: 'type must be "kanji", "vocabulary", or "katakana"' });
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

// ─── Encounter Zones ──────────────────────────────────────────────────────────

function readZone(id) {
    const file = path.join(ZONES_DIR, `${id}.json`);
    if (!fs.existsSync(file)) return null;
    try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return null; }
}

function writeZone(zone) {
    fs.writeFileSync(path.join(ZONES_DIR, `${zone.id}.json`), JSON.stringify(zone, null, 2), 'utf-8');
}

app.get('/api/zones', (req, res) => {
    const files = fs.readdirSync(ZONES_DIR).filter(f => f.endsWith('.json'));
    const zones = files
        .map(f => {
            try {
                const zone = JSON.parse(fs.readFileSync(path.join(ZONES_DIR, f), 'utf-8'));
                return { id: zone.id, name: zone.name, createdAt: zone.createdAt, updatedAt: zone.updatedAt };
            } catch { return null; }
        })
        .filter(Boolean)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.json(zones);
});

app.get('/api/zones/:id', (req, res) => {
    const zone = readZone(req.params.id);
    if (!zone) return res.status(404).json({ error: 'Zone not found' });
    res.json(zone);
});

app.post('/api/zones', (req, res) => {
    const { name, sections } = req.body;
    if (!name || typeof name !== 'string' || !name.trim())
        return res.status(400).json({ error: 'name is required' });
    const now = new Date().toISOString();
    const zone = {
        id: randomUUID(),
        name: name.trim(),
        sections: sections ?? { common: [], uncommon: [], rare: [], superRare: [] },
        createdAt: now,
        updatedAt: now,
    };
    writeZone(zone);
    res.status(201).json(zone);
});

app.put('/api/zones/:id', (req, res) => {
    const zone = readZone(req.params.id);
    if (!zone) return res.status(404).json({ error: 'Zone not found' });
    const { name, sections } = req.body;
    if (name !== undefined) {
        if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ error: 'name must be a non-empty string' });
        zone.name = name.trim();
    }
    if (sections !== undefined) zone.sections = sections;
    zone.updatedAt = new Date().toISOString();
    writeZone(zone);
    res.json(zone);
});

app.delete('/api/zones/:id', (req, res) => {
    const file = path.join(ZONES_DIR, `${req.params.id}.json`);
    if (!fs.existsSync(file)) return res.status(404).json({ error: 'Zone not found' });
    fs.unlinkSync(file);
    res.sendStatus(204);
});

// ─── Pokemon Cards ────────────────────────────────────────────────────────────

function readCard(id) {
    const file = path.join(POKEMON_CARDS_DIR, `${id}.json`);
    if (!fs.existsSync(file)) return null;
    try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return null; }
}

function writeCard(card) {
    fs.writeFileSync(path.join(POKEMON_CARDS_DIR, `${card.id}.json`), JSON.stringify(card, null, 2), 'utf-8');
}

app.get('/api/pokemon_cards', (req, res) => {
    const files = fs.readdirSync(POKEMON_CARDS_DIR).filter(f => f.endsWith('.json'));
    const cards = files
        .map(f => {
            try {
                const card = JSON.parse(fs.readFileSync(path.join(POKEMON_CARDS_DIR, f), 'utf-8'));
                return {
                    id: card.id,
                    nickname: card.nickname,
                    pokemonName: card.pokemonName,
                    level: card.state?.pokemon_level ?? "",
                    rarity: (card.state?.pokemon_rarity || "Normal").toLowerCase(),
                    notes: card.notes || "",
                    createdAt: card.createdAt,
                    updatedAt: card.updatedAt,
                };
            } catch { return null; }
        })
        .filter(Boolean)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.json(cards);
});

app.get('/api/pokemon_cards/:id', (req, res) => {
    const card = readCard(req.params.id);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    res.json(card);
});

app.post('/api/pokemon_cards', (req, res) => {
    const { nickname, pokemonName, state, notes } = req.body;
    if (!nickname || typeof nickname !== 'string' || !nickname.trim())
        return res.status(400).json({ error: 'nickname is required' });
    const now = new Date().toISOString();
    const card = { id: randomUUID(), nickname: nickname.trim(), pokemonName: pokemonName || '', state: state || {}, notes: notes || '', createdAt: now, updatedAt: now };
    writeCard(card);
    res.status(201).json(card);
});

app.put('/api/pokemon_cards/:id', (req, res) => {
    const card = readCard(req.params.id);
    if (!card) return res.status(404).json({ error: 'Card not found' });
    const { nickname, pokemonName, state, notes } = req.body;
    if (nickname !== undefined) {
        if (typeof nickname !== 'string' || !nickname.trim()) return res.status(400).json({ error: 'nickname must be a non-empty string' });
        card.nickname = nickname.trim();
    }
    if (pokemonName !== undefined) card.pokemonName = pokemonName;
    if (state !== undefined) card.state = state;
    if (notes !== undefined) card.notes = notes;
    card.updatedAt = new Date().toISOString();
    writeCard(card);
    res.json(card);
});

app.delete('/api/pokemon_cards/:id', (req, res) => {
    const file = path.join(POKEMON_CARDS_DIR, `${req.params.id}.json`);
    if (!fs.existsSync(file)) return res.status(404).json({ error: 'Card not found' });
    fs.unlinkSync(file);
    res.sendStatus(204);
});

// ─── Teams ────────────────────────────────────────────────────────────────────

function readTeam(id) {
    const file = path.join(TEAMS_DIR, `${id}.json`);
    if (!fs.existsSync(file)) return null;
    try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return null; }
}

function writeTeam(team) {
    fs.writeFileSync(path.join(TEAMS_DIR, `${team.id}.json`), JSON.stringify(team, null, 2), 'utf-8');
}

app.get('/api/teams', (req, res) => {
    const files = fs.readdirSync(TEAMS_DIR).filter(f => f.endsWith('.json'));
    const teams = files
        .map(f => {
            try {
                const t = JSON.parse(fs.readFileSync(path.join(TEAMS_DIR, f), 'utf-8'));
                const slotCount = (t.slots || []).filter(Boolean).length;
                return { id: t.id, name: t.name, slotCount, createdAt: t.createdAt, updatedAt: t.updatedAt };
            } catch { return null; }
        })
        .filter(Boolean)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    res.json(teams);
});

app.get('/api/teams/:id', (req, res) => {
    const team = readTeam(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
});

app.post('/api/teams', (req, res) => {
    const { name, selectedType, slots } = req.body;
    if (!name || typeof name !== 'string' || !name.trim())
        return res.status(400).json({ error: 'name is required' });
    const now = new Date().toISOString();
    const team = {
        id: randomUUID(),
        name: name.trim(),
        selectedType: selectedType || 'Fire',
        slots: slots ?? Array(6).fill(null),
        createdAt: now,
        updatedAt: now,
    };
    writeTeam(team);
    res.status(201).json(team);
});

app.put('/api/teams/:id', (req, res) => {
    const team = readTeam(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    const { name, selectedType, slots } = req.body;
    if (name !== undefined) {
        if (typeof name !== 'string' || !name.trim()) return res.status(400).json({ error: 'name must be a non-empty string' });
        team.name = name.trim();
    }
    if (selectedType !== undefined) team.selectedType = selectedType;
    if (slots !== undefined) team.slots = slots;
    team.updatedAt = new Date().toISOString();
    writeTeam(team);
    res.json(team);
});

app.delete('/api/teams/:id', (req, res) => {
    const file = path.join(TEAMS_DIR, `${req.params.id}.json`);
    if (!fs.existsSync(file)) return res.status(404).json({ error: 'Team not found' });
    fs.unlinkSync(file);
    res.sendStatus(204);
});

// ─── Pokemon static data ───────────────────────────────────────────────────────

app.get('/api/pokemon', (req, res) => {
    res.sendFile(path.join(POKEMON_DATA_DIR, 'pokemon.json'));
});

app.get('/api/moves', (req, res) => {
    res.sendFile(path.join(POKEMON_DATA_DIR, 'moves.json'));
});

app.get('/api/abilities', (req, res) => {
    res.sendFile(path.join(POKEMON_DATA_DIR, 'abilities.json'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Deck server listening on port ${PORT}`));
