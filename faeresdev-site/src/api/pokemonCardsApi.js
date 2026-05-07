const BASE = '/api/pokemon_cards';

export async function listCards() {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error('Failed to list cards');
    return res.json();
}

export async function getCard(id) {
    const res = await fetch(`${BASE}/${id}`);
    if (!res.ok) throw new Error('Card not found');
    return res.json();
}

export async function createCard(nickname, pokemonName, state, notes) {
    const res = await fetch(BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname, pokemonName, state, notes: notes || '' }),
    });
    if (!res.ok) throw new Error('Failed to create card');
    return res.json();
}

export async function updateCard(id, data) {
    const res = await fetch(`${BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update card');
    return res.json();
}

export async function deleteCard(id) {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete card');
}
