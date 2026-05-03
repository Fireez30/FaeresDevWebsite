# Deck Server

A small Express API that stores training decks (kanji and vocabulary) as JSON files on the server. The frontend reads and writes decks through this API.

## How it works

- Decks are stored as individual `.json` files in the `decks/` folder
- The server exposes a REST API under `/api/decks`
- The Vite frontend proxies `/api` to this server in dev mode
- In production, nginx forwards `/api` requests to this server

## Starting the server

```bash
cd server
node index.js
```

For persistent execution (recommended), run it in a tmux session:

```bash
tmux new -s deck-server
node index.js
# Detach with Ctrl+B then D
```

The server listens on **port 3001** by default. To use a different port:

```bash
PORT=4000 node index.js
```

## Nginx configuration

In your nginx site config (usually `/etc/nginx/sites-available/your-site`), add the following block **inside the `server { }` block, before the main `location /` block**:

```nginx
location /api/ {
    proxy_pass http://localhost:3001/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

Then test and reload nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

If you changed the default port, update `3001` in the `proxy_pass` line accordingly.

## API reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/decks` | List all decks (metadata, no entries) |
| GET | `/api/decks/:id` | Get a single deck with all entries |
| POST | `/api/decks` | Create a deck — body: `{ name, type }` |
| PUT | `/api/decks/:id` | Update name and/or entries — body: `{ name?, entries? }` |
| DELETE | `/api/decks/:id` | Delete a deck |

`type` must be either `"kanji"` or `"vocabulary"`.

A kanji entry: `{ kanji, translation, kun, on }`  
A vocabulary entry: `{ japanese, translation }`

## Deck files

Each deck is stored as `decks/<uuid>.json`:

```json
{
  "id": "550e8400-...",
  "name": "My Kanji Deck",
  "type": "kanji",
  "entries": [
    { "kanji": "人", "translation": "person", "kun": "ひと", "on": "じん" }
  ],
  "createdAt": "2026-05-03T10:00:00.000Z"
}
```

You can edit these files directly if needed — just restart the server after manual edits.
