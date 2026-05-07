const BASE = '/api';

export async function fetchPokemon() {
    const res = await fetch(`${BASE}/pokemon`);
    if (!res.ok) throw new Error('Failed to fetch pokemon data');
    return res.json();
}

export async function fetchMoves() {
    const res = await fetch(`${BASE}/moves`);
    if (!res.ok) throw new Error('Failed to fetch moves data');
    return res.json();
}

export async function fetchAbilities() {
    const res = await fetch(`${BASE}/abilities`);
    if (!res.ok) throw new Error('Failed to fetch abilities data');
    return res.json();
}
