export async function fetchWsDeck(url) {
    const res = await fetch(`/api/ws-deck?url=${encodeURIComponent(url)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Failed to fetch deck');
    return data;
}
