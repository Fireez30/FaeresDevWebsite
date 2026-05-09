const BASE = '/api';

export async function fetchRandomHiraganaWords(count) {
    const params = new URLSearchParams();
    params.append("count", count);
    const res = await fetch(`${BASE}/hiragana_words?${params}`);
    if (!res.ok) throw new Error('Hiragana words not found');
    return res.json();
}

export async function fetchRandomKatakanaWords(count) {
    const params = new URLSearchParams();
    params.append("count", count);
    const res = await fetch(`${BASE}/katakana_words?${params}`);
    if (!res.ok) throw new Error('Katakana words not found');
    return res.json();
}
