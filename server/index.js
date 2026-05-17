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

// Allow only canonical UUIDs as :id values — prevents path traversal when
// req.params.id is interpolated into a filesystem path.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isValidId(id) {
    return typeof id === 'string' && UUID_RE.test(id);
}

// Coerce a query-string count to a bounded integer.
function parseCount(raw, max) {
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.min(n, max);
}

// Fetch with a hard timeout so a slow upstream cannot pin server resources.
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

// ─── Japanese ────────────────────────────────────────────────────────────────────

function getRandomItemsFromArray(arr, random_count) {
    const wanted = Math.min(random_count, arr.length);
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, wanted);
}

function serveRandomWords(file, req, res) {
    const count = parseCount(req.query.count, 200);
    if (count === null) return res.status(400).json({ error: 'count must be a positive integer' });
    try {
        const words = JSON.parse(fs.readFileSync(file, 'utf8'));
        if (!Array.isArray(words)) return res.status(500).json({ error: 'Word list malformed' });
        return res.json(getRandomItemsFromArray(words, count));
    } catch {
        return res.status(500).json({ error: 'Could not load word list' });
    }
}

app.get('/api/hiragana_words', (req, res) => serveRandomWords(HIRAGANA_WORDS_FILE, req, res));
app.get('/api/katakana_words', (req, res) => serveRandomWords(KATAKANA_WORDS_FILE, req, res));


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
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
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
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
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
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
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
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
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
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
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
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
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
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
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
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
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
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
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
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
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
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
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
    if (!isValidId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
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

// ─── WS Translation cache ─────────────────────────────────────────────────────

const WS_CACHE_FILE = path.join(__dirname, 'ws_translation_cache.json');
let wsTranslationCache = {};
try {
    if (fs.existsSync(WS_CACHE_FILE))
        wsTranslationCache = JSON.parse(fs.readFileSync(WS_CACHE_FILE, 'utf-8'));
} catch {}

function saveWsCache() {
    fs.writeFileSync(WS_CACHE_FILE, JSON.stringify(wsTranslationCache, null, 2), 'utf-8');
}

// Known WS trait/name fixes after translation (regex → replacement pairs)
const WS_FIXES = [
    [/\bSummer Poke\b/g, 'Summer Pockets'],
    [/\bSummer Pocket\b/g, 'Summer Pockets'],  // without trailing s
];

// Fix WS keyword notation that Google Translate mangles
function fixWsKeywords(text) {
    if (!text) return text;
    let t = text
        // Direct bracket conversion (Google Translate often outputs these correctly but with [] instead of 【】)
        .replace(/\[AUTO\]/g, '【AUTO】')
        .replace(/\[CONT\]/g, '【CONT】')
        .replace(/\[ACT\]/g, '【ACT】')
        .replace(/\[COUNTER\]/g, '【COUNTER】')
        .replace(/\[Reverse\]/gi, '【Reverse】')
        .replace(/\[Stand\]/gi, '【Stand】')
        .replace(/\[Rest\]/gi, '【Rest】')
        .replace(/\[CX Combo\]/gi, '【CX Combo】')
        .replace(/\[Clock Encore\]/gi, '【Clock Encore】')
        .replace(/\[Bond\]/gi, '【Bond】')
        .replace(/\[Backup\]/gi, '【Backup】')
        .replace(/\[Brainstorm\]/gi, '【Brainstorm】')
        .replace(/\[TREASURE\]/gi, '【TREASURE】')
        .replace(/\[GOLD\]/gi, '【GOLD】')
        .replace(/\[POOL\]/gi, '【POOL】')
        .replace(/\[SHOT\]/gi, '【SHOT】')
        .replace(/\[BOUNCE\]/gi, '【BOUNCE】')
        .replace(/\[GATE\]/gi, '【GATE】')
        .replace(/\[SALVAGE\]/gi, '【SALVAGE】')
        // Fallback for mangled translations
        .replace(/\[?【?(?:Automatic|Automatique|自動)\]?】?/g, '【AUTO】')
        .replace(/\[?【?(?:Permanent|Continuous|Continu|Forever|永続)\]?】?/g, '【CONT】')
        .replace(/\[?【?(?:Activate|Activation|起動)\]?】?/g, '【ACT】');
    for (const [pattern, replacement] of WS_FIXES)
        t = t.replace(pattern, replacement);
    return t;
}

async function googleTranslate(text) {
    if (!text) return '';
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const r = await fetchWithTimeout(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, 8000);
    if (!r.ok) return text;
    const data = await r.json();
    const translated = data[0].map(chunk => chunk[0]).join('');
    return fixWsKeywords(translated);
}

async function translateCardIfNeeded(serial, name, traits, effect) {
    if (wsTranslationCache[serial]) {
        // Re-apply keyword fixes in case the cache predates a fix update
        const c = wsTranslationCache[serial];
        return { name: fixWsKeywords(c.name), traits: fixWsKeywords(c.traits), effect: fixWsKeywords(c.effect) };
    }
    // Sequential to avoid hitting Google Translate rate limits
    const tName   = await googleTranslate(name);
    const tTraits = await googleTranslate(traits);
    const tEffect = await googleTranslate(effect);
    const result = { name: tName, traits: tTraits, effect: tEffect };
    wsTranslationCache[serial] = result;
    saveWsCache();
    return result;
}

// ─── WS Deck Proxy ────────────────────────────────────────────────────────────

function detectWsSource(parsed) {
    const host = parsed.hostname.toLowerCase();
    if (host === 'encoredecks.com' || host === 'www.encoredecks.com') return 'encoredecks';
    if (host === 'decklog.bushiroad.com') return 'decklog';
    return null;
}

function extractWsDeckId(parsed, source) {
    if (source === 'encoredecks') {
        const m = parsed.pathname.match(/\/deck\/([A-Za-z0-9_-]{1,64})/);
        return m?.[1] ?? null;
    }
    if (source === 'decklog') {
        const m = parsed.pathname.match(/\/view\/([A-Za-z0-9]{1,64})/);
        return m?.[1] ?? null;
    }
    return null;
}

function pickLocale(entry) {
    const locales = entry.locale ?? {};
    for (const lang of ['EN', 'NP']) {
        const loc = locales[lang];
        if (loc && (loc.name || (loc.ability && loc.ability.length) || (loc.attributes && loc.attributes.length)))
            return { loc, lang };
    }
    return { loc: null, lang: null };
}

function extractJpTraits(abilityLines) {
    const text = abilityLines.join(' ');
    const found = [...text.matchAll(/《([^》]+)》/g)].map(m => m[1]);
    return [...new Set(found)];
}

function normalizeEncoreCard(entry) {
    const { loc, lang } = pickLocale(entry);
    const name = loc?.name ?? entry.name ?? '';
    const locAttributes = loc?.attributes ?? [];
    const jpAbility = entry.locale?.NP?.ability ?? [];
    const traits = locAttributes.length
        ? locAttributes.join('・')
        : extractJpTraits(jpAbility).join('・');
    const effect = (loc?.ability ?? entry.ability ?? []).join('\n');
    const needsTranslation = lang !== 'EN';
    return {
        serial: entry.cardcode ?? entry.sid ?? '',
        name,
        traits,
        effect,
        quantity: entry.armycount ?? entry.amount ?? 1,
        needsTranslation,
    };
}

app.get('/api/ws-deck', async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url parameter required' });

    let parsed;
    try {
        parsed = new URL(url);
    } catch {
        return res.status(400).json({ error: 'Invalid URL' });
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')
        return res.status(400).json({ error: 'URL must be http(s)' });

    const source = detectWsSource(parsed);
    if (!source) return res.status(400).json({ error: 'URL must be from encoredecks.com or decklog.bushiroad.com' });

    const deckId = extractWsDeckId(parsed, source);
    if (!deckId) return res.status(400).json({ error: 'Could not extract deck ID from URL' });

    const headers = { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' };

    try {
        let cards = [];
        let deckName = deckId;

        if (source === 'encoredecks') {
            const r = await fetchWithTimeout(`https://www.encoredecks.com/api/deck/${deckId}`, { headers }, 8000);
            if (!r.ok) return res.status(502).json({ error: `encoredecks returned HTTP ${r.status}` });
            const data = await r.json();
            deckName = data.name ?? data.title ?? deckId;
            const rawCards = data.cards ?? data.card_list ?? [];

            // API returns one entry per copy — group by cardcode to get quantity
            const byCode = new Map();
            for (const entry of rawCards) {
                const code = entry.cardcode ?? entry.sid ?? '';
                if (byCode.has(code)) byCode.get(code).count++;
                else byCode.set(code, { entry, count: 1 });
            }

            cards = [...byCode.values()].map(({ entry, count }) => ({
                ...normalizeEncoreCard(entry),
                quantity: count,
            }));
        }

        if (source === 'decklog') {
            const r = await fetchWithTimeout(`https://decklog.bushiroad.com/system/app/api/view/${deckId}`, { headers }, 8000);
            if (!r.ok) return res.status(502).json({ error: `decklog returned HTTP ${r.status}` });
            const data = await r.json();
            deckName = data.title ?? data.name ?? deckId;
            const rawCards = data.card_list ?? data.cards ?? [];
            cards = rawCards.map(entry => ({
                serial: entry.card_number ?? entry.cardNumber ?? '',
                name: entry.name ?? '',
                traits: entry.character ?? entry.traits ?? '',
                effect: entry.text ?? '',
                quantity: entry.cnt ?? entry.count ?? 1,
                needsTranslation: true,
            }));
        }

        // Translate JP-only cards sequentially (cached after first call)
        const translated = [];
        for (const card of cards) {
            if (!card.needsTranslation) {
                translated.push(card);
            } else {
                const t = await translateCardIfNeeded(card.serial, card.name, card.traits, card.effect);
                translated.push({ ...card, name: t.name, traits: t.traits, effect: t.effect, needsTranslation: false });
            }
        }

        return res.json({ deckName, cards: translated });
    } catch (err) {
        return res.status(500).json({ error: `Proxy error: ${err.message}` });
    }
});

// ─── WS Proxy Deck (card images for proxy printing) ──────────────────────────


app.get('/api/ws-proxy-deck', async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url parameter required' });

    let parsed;
    try { parsed = new URL(url); } catch {
        return res.status(400).json({ error: 'Invalid URL' });
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')
        return res.status(400).json({ error: 'URL must be http(s)' });

    const source = detectWsSource(parsed);
    if (!source) return res.status(400).json({ error: 'URL must be from encoredecks.com or decklog.bushiroad.com' });

    const deckId = extractWsDeckId(parsed, source);
    if (!deckId) return res.status(400).json({ error: 'Could not extract deck ID from URL' });

    const headers = { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' };

    try {
        let cards = [];
        let deckName = deckId;

        if (source === 'encoredecks') {
            const r = await fetchWithTimeout(`https://www.encoredecks.com/api/deck/${deckId}`, { headers }, 8000);
            if (!r.ok) return res.status(502).json({ error: `encoredecks returned HTTP ${r.status}` });
            const data = await r.json();
            deckName = data.name ?? data.title ?? deckId;
            const rawCards = data.cards ?? data.card_list ?? [];

            const byCode = new Map();
            for (const entry of rawCards) {
                const code = entry.cardcode ?? entry.sid ?? '';
                if (byCode.has(code)) byCode.get(code).count++;
                else byCode.set(code, { entry, count: 1 });
            }

            cards = [...byCode.values()].map(({ entry, count }) => {
                const { loc } = pickLocale(entry);
                const name = loc?.name ?? entry.name ?? (entry.cardcode ?? '');
                const serial = entry.cardcode ?? entry.sid ?? '';
                const imgPath = entry.imagepath ?? null;
                const imageUrl = imgPath
                    ? (imgPath.startsWith('http') ? imgPath : `https://www.encoredecks.com/images/${imgPath.replace(/^\//, '')}`)
                    : null;
                const isClimax = (entry.type ?? entry.cardtype ?? '').toUpperCase() === 'CX';
                return { serial, name, quantity: count, imageUrl, isClimax };
            });
        }

        if (source === 'decklog') {
            const r = await fetchWithTimeout(`https://decklog.bushiroad.com/system/app/api/view/${deckId}`, { headers }, 8000);
            if (!r.ok) return res.status(502).json({ error: `decklog returned HTTP ${r.status}` });
            const data = await r.json();
            deckName = data.title ?? data.name ?? deckId;
            const rawCards = data.card_list ?? data.cards ?? [];

            cards = rawCards.map(entry => {
                const serial = entry.card_number ?? entry.cardNumber ?? '';
                const name = entry.name ?? serial;
                const quantity = entry.cnt ?? entry.count ?? 1;

                const imgField = entry.img_url ?? entry.imgUrl ?? entry.image ?? entry.img ?? null;
                let imageUrl = null;
                if (imgField) {
                    imageUrl = imgField.startsWith('http')
                        ? imgField
                        : `https://ws-tcg.com${imgField}`;
                }

                return { serial, name, quantity, imageUrl };
            });
        }

        return res.json({ deckName, cards });
    } catch (err) {
        return res.status(500).json({ error: `Proxy error: ${err.message}` });
    }
});

// ─── WS Card Image Proxy ──────────────────────────────────────────────────────

const WS_IMAGE_ALLOWED_HOSTS = new Set([
    'www.encoredecks.com', 'encoredecks.com',
    'ws-tcg.com', 'www.ws-tcg.com',
    'decklog.bushiroad.com', 'bushiroad.com', 'www.bushiroad.com',
    's3.amazonaws.com',
]);

app.get('/api/ws-image', async (req, res) => {
    const { url } = req.query;
    if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url required' });

    let parsed;
    try { parsed = new URL(url); } catch {
        return res.status(400).json({ error: 'Invalid URL' });
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:')
        return res.status(400).json({ error: 'URL must be http(s)' });
    if (!WS_IMAGE_ALLOWED_HOSTS.has(parsed.hostname))
        return res.status(403).json({ error: 'Image host not allowed' });

    try {
        const r = await fetchWithTimeout(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, 10000);
        const contentType = r.headers.get('content-type') ?? '';

        if (!r.ok) return res.status(r.status).json({ error: `Upstream returned ${r.status}` });

        if (!contentType.startsWith('image/'))
            return res.status(400).json({ error: 'Not an image', url, contentType });

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        const buf = await r.arrayBuffer();
        res.send(Buffer.from(buf));
    } catch (err) {
        return res.status(500).json({ error: `Image proxy error: ${err.message}` });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Deck server listening on port ${PORT}`));
