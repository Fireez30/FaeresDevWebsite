# FaeresDev Website — Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Running the project](#running-the-project)
3. [Server — Deck API](#server--deck-api)
4. [Frontend API client — `decksApi.js`](#frontend-api-client--decksapijs)
5. [App shell — `App.jsx`](#app-shell--appjsx)
6. [Home — `Home.jsx`](#home--homejsx)
7. [Deck Manager — `DeckManager.jsx`](#deck-manager--deckmanagerjsx)
8. [Hiragana Trainer — `HiraganaTrainer.jsx`](#hiragana-trainer--hiraganatrainerjsx)
9. [Katakana Trainer — `KatakanaTrainer.jsx`](#katakana-trainer--katakanatrainerjsx)
10. [Kanji Trainer — `KanjiTrainer.jsx`](#kanji-trainer--kanjitrainerjsx)
11. [Kanji Writing Trainer — `KanjiWritingTrainer.jsx`](#kanji-writing-trainer--kanjiwritingtrainerjsx)
12. [Vocabulary Trainer — `VocabularyTrainer.jsx`](#vocabulary-trainer--vocabularytrainerjsx)
13. [Katakana Word Trainer — `KatakanaWordTrainer.jsx`](#katakana-word-trainer--katakanawordtrainerjsx)
14. [Japanese Sentence Color Trainer — `JapaneseSentenceColorTrainer.jsx`](#japanese-sentence-color-trainer--japanesesentencecolortrainerjsx)
15. [Pokemon Generator — `PokemonGenerator.jsx`](#pokemon-generator--pokemongeneratorjsx)
16. [Pokemon Encounter Generator — `PokemonEncounterGenerator.jsx`](#pokemon-encounter-generator--pokemonencountergeneratorjsx)
17. [Dice Rolls — `rolls.jsx`](#dice-rolls--rollsjsx)
18. [Pokemon Team Card — `PokemonTeamCard.jsx`](#pokemon-team-card--pokemonteamcardjsx)

---

## Project Overview

A personal website with two families of tools:

- **Pokemon RPG tools** — generators and dice helpers for a tabletop Pokemon RPG campaign.
- **Japanese learning tools** — interactive quiz cards for hiragana, katakana, kanji, vocabulary, and sentence analysis.

The **frontend** is a Vite + React SPA (`faeresdev-site/`).  
The **backend** is a small Express server (`server/`) that persists study decks as JSON files on disk.

---

## Running the project

### Frontend (Vite dev server)

```bash
cd faeresdev-site
npm install
npm run dev        # starts on http://localhost:5173
```

Build for production:

```bash
npm run build      # outputs to faeresdev-site/dist/
npm run preview    # serve the built output locally
```

### Backend (Deck server)

```bash
cd server
npm install
npm run dev        # node --watch, restarts on file change
# or
npm start          # plain node
```

The server listens on **port 3001** by default (override with `PORT` env var).  
Decks are stored as JSON files in `server/decks/`.

### Vite proxy

In development, Vite proxies two paths so the frontend doesn't need CORS configuration:

| Prefix | Target |
|--------|--------|
| `/api` | `http://localhost:3001` (Deck server) |
| `/jisho-api` | `https://jisho.org` (used by KatakanaWordTrainer) |

---

## Server — Deck API

`server/index.js` — Express REST API for CRUD operations on study decks.

Decks are stored as `server/decks/<uuid>.json`.

### Data model

```json
{
  "id": "<uuid>",
  "name": "My deck",
  "type": "kanji",
  "entries": [...],
  "createdAt": "2026-01-01T00:00:00.000Z"
}
```

`type` must be one of `"kanji"`, `"vocabulary"`, or `"katakana"`.

#### Entry shapes by type

**kanji**
```json
{ "kanji": "山", "translation": "mountain", "kun": "やま", "on": "サン" }
```

**vocabulary**
```json
{ "japanese": "ありがとう", "translation": "thank you" }
```

**katakana**
```json
{ "katakana": "コーヒー", "translation": "coffee" }
```

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/decks` | List all decks (summary only: id, name, type, entryCount, createdAt) |
| `GET` | `/api/decks/:id` | Get a single deck with all its entries |
| `POST` | `/api/decks` | Create a new deck |
| `PUT` | `/api/decks/:id` | Update a deck's name and/or entries |
| `DELETE` | `/api/decks/:id` | Delete a deck permanently |

#### `POST /api/decks` — request body

```json
{ "name": "JLPT N5 Kanji", "type": "kanji" }
```

Returns `201` with the created deck object.

#### `PUT /api/decks/:id` — request body

Both fields are optional; send only what you want to change.

```json
{
  "name": "Renamed deck",
  "entries": [
    { "kanji": "日", "translation": "sun / day", "kun": "ひ", "on": "ニチ" }
  ]
}
```

---

## Frontend API client — `decksApi.js`

`faeresdev-site/src/api/decksApi.js`

Thin wrappers around `fetch`. All functions throw on non-2xx responses.

```js
import { listDecks, getDeck, createDeck, updateDeck, deleteDeck } from '../api/decksApi.js';

// List deck summaries (no entries)
const summaries = await listDecks();

// Full deck with entries
const deck = await getDeck(id);

// Create — type: 'kanji' | 'vocabulary' | 'katakana'
const newDeck = await createDeck('My deck', 'vocabulary');

// Update name and/or entries
const updated = await updateDeck(id, { name: 'New name', entries: [...] });

// Delete (returns nothing)
await deleteDeck(id);
```

---

## App shell — `App.jsx`

`faeresdev-site/src/components/App.jsx`

Root component. Renders the Ant Design `Layout` with a persistent header, navigation menu, content area, and footer.

**Navigation** is driven by the `items` array (nested Ant Design `Menu`). Clicking a menu item calls `navigate(key)` where `key` is the route path (e.g. `/hiragana-training`).

**Routes** map paths to components via React Router v7 `<Routes>`. All unknown paths fall back to `<Home />`.

The component is not configurable — to add a new page:

1. Import the component.
2. Add a menu entry to the `items` array.
3. Add a `<Route>` inside `<Routes>`.

---

## Home — `Home.jsx`

`faeresdev-site/src/components/Home.jsx`

Static landing page. Renders a hero section (author bio + photo) and a grid of tool cards, grouped by category.

The card list is driven by the `sections` array defined at the top of the file. To add or change a card, edit that array — no JSX changes needed.

```js
const sections = [
  {
    title: "Section title",
    items: [
      { title: "Card title", href: "/route", description: "..." },
    ],
  },
];
```

---

## Deck Manager — `DeckManager.jsx`

`faeresdev-site/src/components/DeckManager.jsx`

Full CRUD UI for managing study decks stored on the server.

### How it works

On mount, calls `listDecks()`. If the server is unreachable, a warning banner is shown and the "New deck" button is hidden.

**Sidebar (`DeckList`)** — lists decks grouped by type (Kanji / Vocabulary / Katakana). Clicking a deck fetches its full data and opens the editor.

**Editor (`DeckEditor`)** — shows the selected deck's name and entries. Inline row components differ by deck type:

| Deck type | Row fields |
|-----------|-----------|
| `kanji` | Kanji character, Translation, Kun reading, On reading |
| `vocabulary` | Japanese text, Translation |
| `katakana` | Katakana text, Translation |

The "Save entries" button calls `updateDeck` with the current entry list. Name edits are saved immediately when the user presses Enter or clicks Save.

**Create modal (`CreateDeckModal`)** — name input + type selector (Kanji / Vocabulary / Katakana). Calls `createDeck` on submit.

### Usage

Navigate to `/deck-manager`. The server must be running for the UI to be functional. Create a deck, add entries, and click "Save entries". Decks created here are immediately available in the trainer dropdowns.

---

## Hiragana Trainer — `HiraganaTrainer.jsx`

`faeresdev-site/src/components/HiraganaTrainer.jsx`

Multiple-choice quiz for hiragana reading.

### Dataset

`HIRAGANA_SET` — 100+ entries covering:
- Base hiragana (あ–ん)
- Voiced/semi-voiced variants (が, ば, ぱ…)
- Kana combinations imported from `kanaCombinations.js`
- Double-consonant words (っ, e.g. `あっち`)
- Long-vowel words (e.g. `えいが`)

### Quiz modes

| Mode | Prompt | Answer |
|------|--------|--------|
| `kana-to-romaji` | Hiragana character/word | Pick the romaji |
| `romaji-to-kana` | Romaji | Pick the hiragana |

### How it works

`buildQuestion(quizMode, previousIndex)` picks a random entry (different from the previous one), then builds 2 distractors that have distinct display values. The 3 answers are shuffled before display.

After an answer is clicked:
- Correct: button turns green.
- Wrong: button turns red; the correct answer is revealed in green.
- Score is updated and shown with a color state (`is-strong` / `is-neutral` / `is-weak`).

Click "Next Hiragana" to advance.

---

## Katakana Trainer — `KatakanaTrainer.jsx`

`faeresdev-site/src/components/KatakanaTrainer.jsx`

Identical quiz structure to `HiraganaTrainer`, but for katakana.

### Dataset

`KATAKANA_SET` — base katakana, voiced variants, combinations from `kanaCombinations.js`, plus ~30 common loanwords (e.g. `ゲーム`, `コーヒー`).

Romaji answers are displayed in **uppercase** (via `formatKatakanaRomaji`).

### Quiz modes

| Mode | Prompt | Answer |
|------|--------|--------|
| `kana-to-romaji` | Katakana character/word | Pick the ROMAJI |
| `romaji-to-kana` | ROMAJI | Pick the katakana |

Behaviour and scoring are identical to HiraganaTrainer.

---

## Kanji Trainer — `KanjiTrainer.jsx`

`faeresdev-site/src/components/KanjiTrainer.jsx`

Three-step multiple-choice quiz for kanji. Each kanji card tests three aspects in sequence.

### Dataset sources

- **Built-in**: `KANJI_SET` from `src/data/kanjiTrainingData.js`
- **Custom deck**: any `kanji`-type deck from the server (needs ≥ 3 entries to replace the built-in set)

A deck selector dropdown appears if the server is reachable.

### Quiz modes

| Mode | Step 1 | Step 2 | Step 3 |
|------|--------|--------|--------|
| `kanji-to-translation` | Pick translation | Pick kun reading | Pick on reading |
| `translation-to-kanji` | Pick kanji | Pick kun reading | Pick on reading |

### How it works

`buildDistractors(dataset, correctIdx, step)` picks 2 other entries whose value for the current step field differs from the correct one.

Progress through the 3 steps is tracked with `stepIndex`. A dot indicator shows current and completed steps. After the last step, "Next Kanji" picks a new entry.

---

## Kanji Writing Trainer — `KanjiWritingTrainer.jsx`

`faeresdev-site/src/components/KanjiWritingTrainer.jsx`

Combines a freehand drawing canvas with a kun-reading multiple-choice question.

### Dataset sources

Same as KanjiTrainer — built-in set or a custom kanji deck.

### How it works

1. The English translation is shown as the prompt.
2. The user **draws** the kanji in the 220×220 canvas (mouse and touch supported).
3. The user selects the **kun reading** from 3 choices.
4. Click "Validate" — both the drawing canvas locks and the SVG stroke-order diagram loads from `cdn.jsdelivr.net/gh/KanjiVG/kanjivg`.
5. The user compares their drawing to the stroke-order reference.
6. Click "Next Kanji" to continue.

**Canvas internals**: strokes are stored in `strokesRef` (array of point arrays). The canvas re-draws all strokes from scratch on each question reset. Cross-hair guide lines are drawn in dashed style.

Stroke-order SVGs are fetched by Unicode code point (the first CJK character in the kanji field). If the image fails to load, a fallback message is shown.

---

## Vocabulary Trainer — `VocabularyTrainer.jsx`

`faeresdev-site/src/components/VocabularyTrainer.jsx`

Multiple-choice quiz for Japanese vocabulary.

### Dataset sources

- **Built-in**: `VOCAB_SET` from `src/data/vocabularyTrainingData.js`
- **Custom deck**: any `vocabulary`-type deck from the server (needs ≥ 3 entries)

### Quiz modes

| Mode | Prompt | Answers |
|------|--------|---------|
| `vocab-to-translation` | Japanese word/phrase | Pick English translation |
| `translation-to-vocab` | English translation | Pick Japanese word/phrase |

Behaviour (scoring, feedback, next button) mirrors HiraganaTrainer.

---

## Katakana Word Trainer — `KatakanaWordTrainer.jsx`

`faeresdev-site/src/components/KatakanaWordTrainer.jsx`

**Type-in** quiz (not multiple-choice). Tests loanword recognition.

### Data loading

On mount, fetches random common katakana words from the **Jisho API** (proxied via `/jisho-api`). Picks a random page (1–8) and filters results to entries that are purely katakana. Falls back to `FALLBACK_WORDS` (10 built-in words) if the fetch fails. A "Load new batch" button re-fetches.

### Quiz modes

| Mode | Prompt | Expected input |
|------|--------|---------------|
| `katakana-to-word` | Katakana word | Type the English translation |
| `word-to-katakana` | English word | Type it in katakana (requires Japanese IME) |

### How it works

The user types an answer and presses Enter or clicks "Check". `checkAnswer` normalises the input (trim, lowercase) and compares against all slash-separated variants in the expected answer. After submission the input is locked. Press Enter again or click "Next" / "Skip" to advance.

---

## Japanese Sentence Color Trainer — `JapaneseSentenceColorTrainer.jsx`

`faeresdev-site/src/components/JapaneseSentenceColorTrainer.jsx`

Color-tagging quiz — the user assigns a script type to every character token in a Japanese sentence.

### Data loading

On mount, fetches a sentence from the **Tatoeba API** (Japanese sentences with French or English translations). Falls back to `FALLBACK_JAPANESE_SENTENCES` from `japaneseScriptColorGameData.js` if the fetch fails.

### Token types

| Type | Color | Description |
|------|-------|-------------|
| `hiragana` | Blue | Hiragana characters |
| `katakana` | Green | Katakana characters |
| `combination` | Pink | Two-character kana combinations (e.g. きゃ, ティ) |
| `kanji` | Red | CJK ideographs |
| `romaji` | Purple | Latin letters / digits |
| `break` | Amber | Pause marks (っ, ッ, 、, …) |
| `long` | Teal | Long vowel mark (ー) |

Terminal punctuation (。.！？) is locked and displayed without a tag button.

### How it works

`tokenizeSentence(text)` iterates over Unicode characters. For each position it first checks if a two-character combination (from `kanaCombinations.js`) starts here; if so it emits one combined token and skips the next character. Otherwise it classifies the single character via regex/set lookups.

**Workflow:**

1. Select a type from the palette.
2. Click tokens to assign the selected type (visible as a colored label under each character).
3. Repeat until all tokens are assigned.
4. Click "Validate" — tokens turn green (correct) or red (wrong). The correct type label appears on wrong tokens. The translation is revealed.
5. Click "New sentence" to fetch the next one.

---

## Pokemon Generator — `PokemonGenerator.jsx`

`faeresdev-site/src/components/PokemonGenerator.jsx`

Full Pokemon character sheet builder for the tabletop RPG. Reads state from Redux (slice: `pokemon`).

### Inputs

| Field | Notes |
|-------|-------|
| Pokemon | Searchable dropdown over `pokemon.json` |
| Level | 1–150 |
| Rarity | Normal / Shiny / Platine |
| Card | None / Normal / Shiny / Platine |
| Gender | Auto-set from gender ratio; Roll button randomises |
| Nature (Buff / Debuff) | Choose two stats; Roll button randomises |
| Abilities | Base (any level), Advanced (≥ 20), High (≥ 40) |
| Level-up points | 9 + level points distributed across 6 stats |
| Moves | Up to 6 level-up moves selected from the Pokemon's learnset |
| Egg moves | Can be locked to force appearance in the sheet |
| TM/HM moves | Can be locked like egg moves |

### Stat calculation

`final_stat = base_stat + auto_buff + manual_points`

`auto_buff` depends on:
- **Card type**: None → +0, Normal → +1, Shiny → +2, Platine → +3 (all stats)
- **Rarity**: Normal → +0, Shiny → +2, Platine → +4 (all stats)
- **Nature**: +`bonus_point_nature_stat` on buffed stat, −`bonus_point_nature_stat` on lowered stat. `bonus_point_nature_stat` starts at 2 and gains +1 if the Pokemon has a card.

### Auto point distribution

The "Auto" button distributes available points proportionally to base stat weights, with leftover points assigned randomly weighted by the same distribution.

### Sheet generation

"Generate Markdown" and "Copy Google Doc version to clipboard" buttons are enabled once all required fields are filled and all level-up points are spent.

The move table layout: first 3 rows are egg/TM moves (locked ones first), next 6 rows are regular moves, then a separator.

Derived stats: `Phys Evade = DEF/10`, `Spec Evade = SPDEF/10`, `Speed Evade = SPD/10`. Hit points = `level + (HP × 3) + 10`. Tutor points = `floor(level / 5)`.

---

## Pokemon Encounter Generator — `PokemonEncounterGenerator.jsx`

`faeresdev-site/src/components/PokemonEncounterGenerator.jsx`

Zone builder and encounter roller for the GM.

### How it works

**Zone editor** (collapsible): four sections — Common, Uncommon, Rare, Super Rare. Each section has a searchable Pokemon selector and an "Add" button. Pokemon cards display the local sprite image (with multiple path fallbacks). A "Roll Pokemon" button (visible when ≥ 2 Pokemon in the section) picks a random one and highlights it.

**Save / Load**: zones are saved as `{ zoneName, sections: { common, uncommon, rare, superRare } }` JSON files and can be reloaded. Invalid Pokemon names (not in `pokemon.json`) are silently filtered on load.

**Encounter rules panel**: enter a value 0–20 and click "Roll". The `resolveEncounterRule` function applies the following table:

| Value | Outcome |
|-------|---------|
| 0 | 0 encounters |
| 1–5 | 2 encounters |
| 6–10 | 4 + 1d4 |
| 11–15 | 6 + 1d6 |
| 16–17 | 8 + 2d6 |
| 18–19 | 10 + 2d8 |
| 20 | Outbreak (d100 sub-table: 50% small, 20% medium, 20% large, 5% huge, 5% massive) |

---

## Dice Rolls — `rolls.jsx`

`faeresdev-site/src/components/rolls.jsx`

Five dice-roll helpers for the Pokemon RPG.

### Expression Roller

Parses an expression like `2d6+1d8+4`. Replaces each `NdM` group with the sum of N random rolls of an M-sided die, then evaluates the resulting arithmetic expression. Shows each individual die result alongside the total.

### Encounter Rolls

Rolls:
- Encounter bracket: d100 (1 = worst, 100 = best)
- Encounter count: d20

### Capture Rolls

Rolls:
- Capture accuracy: d20
- Capture rate: d100

### Shiny Rolls

Configure your personal **shiny number** (1–100) and **Dexnav** level (0–90), then roll a batch. The Dexnav value defines a reroll window: any die result ≤ Dexnav is rerolled (unless it equals the shiny number). Results matching the shiny number are highlighted. Results of 100 when the shiny number was already hit are highlighted as Platine.

Cookie persistence: shiny number and Dexnav are saved in a browser cookie with a 7000-day TTL.

### Card Rolls

Similar reroll logic for card drops. Configurable roll thresholds:
- Three "Normal card" numbers
- Two "Shiny card" numbers (active only if the caught Pokemon is shiny or platine)
- One "Platine card" number (active only if the Pokemon is platine)
- Card Dexnav (own reroll window, adjusted for each defined card number)

Results are colour-coded: normal hit (green), shiny hit (yellow), platine hit (gold).

Cookie persistence: all card thresholds and card Dexnav are saved.

---

## Pokemon Team Card — `PokemonTeamCard.jsx`

`faeresdev-site/src/components/PokemonTeamCard.jsx`

Visual team/NPC card viewer. Lets you compose a team of up to 6 Pokemon for display purposes — no data is persisted.

---

*Generated 2026-05-07. Keep in sync when components are added or significantly changed.*
