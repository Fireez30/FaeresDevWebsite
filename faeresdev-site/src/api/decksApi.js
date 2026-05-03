const BASE = '/api';

export async function listDecks() {
    const res = await fetch(`${BASE}/decks`);
    if (!res.ok) throw new Error('Failed to fetch decks');
    return res.json();
}

export async function getDeck(id) {
    const res = await fetch(`${BASE}/decks/${id}`);
    if (!res.ok) throw new Error('Deck not found');
    return res.json();
}

export async function createDeck(name, type) {
    const res = await fetch(`${BASE}/decks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type }),
    });
    if (!res.ok) throw new Error('Failed to create deck');
    return res.json();
}

export async function updateDeck(id, data) {
    const res = await fetch(`${BASE}/decks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update deck');
    return res.json();
}

export async function deleteDeck(id) {
    const res = await fetch(`${BASE}/decks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete deck');
}
