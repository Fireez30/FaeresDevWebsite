const BASE = '/api/teams';

export async function listTeams() {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error('Failed to list teams');
    return res.json();
}

export async function getTeam(id) {
    const res = await fetch(`${BASE}/${id}`);
    if (!res.ok) throw new Error('Team not found');
    return res.json();
}

export async function createTeam(name, selectedType, slots) {
    const res = await fetch(BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, selectedType, slots }),
    });
    if (!res.ok) throw new Error('Failed to create team');
    return res.json();
}

export async function updateTeam(id, data) {
    const res = await fetch(`${BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update team');
    return res.json();
}

export async function deleteTeam(id) {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete team');
}
