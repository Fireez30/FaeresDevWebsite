const BASE = '/api/zones';

export async function listZones() {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error('Failed to list zones');
    return res.json();
}

export async function getZone(id) {
    const res = await fetch(`${BASE}/${id}`);
    if (!res.ok) throw new Error('Zone not found');
    return res.json();
}

export async function createZone(name, sections) {
    const res = await fetch(BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, sections }),
    });
    if (!res.ok) throw new Error('Failed to create zone');
    return res.json();
}

export async function updateZone(id, data) {
    const res = await fetch(`${BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update zone');
    return res.json();
}

export async function deleteZone(id) {
    const res = await fetch(`${BASE}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete zone');
}
