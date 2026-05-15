import React, { useState } from 'react';
import { Button, Input, Spin, Alert } from 'antd';
import { fetchWsDeck } from '../api/wsApi.js';
import './WSSleeveInserts.css';

// Ordered from most specific to least specific to avoid partial matches
const WS_SHORTEN = [
    // ── Ability types ──────────────────────────────────────────────
    [/【AUTO】/g,              '[A]'],
    [/【CONT】/g,              '[C]'],
    [/【ACT】/g,               '[S]'],
    [/【COUNTER】/gi,          '[CTR]'],
    [/【CX Combo】/gi,         '[CCX]'],
    [/【Clock Encore】/gi,     '[CE]'],
    [/【Bond】/gi,             '[BOND]'],
    [/【Backup】/gi,           '[BKP]'],
    [/【Brainstorm】/gi,       '[BST]'],

    // ── Trigger icons ──────────────────────────────────────────────
    [/【TREASURE】/gi,         '[TRS]'],
    [/【GATE】/gi,             '[GT]'],
    [/【SALVAGE】/gi,          '[SLV]'],
    [/【BOUNCE】/gi,           '[BNC]'],
    [/【SHOT】/gi,             '[SHT]'],
    [/【GOLD】/gi,             '[GLD]'],
    [/【POOL】/gi,             '[POL]'],

    // ── Card states → directional arrows ──────────────────────────
    [/【Reverse】/gi,          '↙'],
    [/【Stand】/gi,            '↑'],
    [/【Rest】/gi,             '→'],

    // ── Long phrases (specific first) ─────────────────────────────
    [/placed on the stage from your hand/gi,   'played'],
    [/placed on the stage/gi,                  'on stage'],
    [/the top card of your deck/gi,            'topdeck'],
    [/top card of your deck/gi,                'topdeck'],
    [/you may pay the cost\. if you do,?/gi,   'pay cost:'],
    [/reveal (?:it|them) to your opponent/gi,  'show opp.'],
    [/and shuffle your deck/gi,                'shuffle deck'],
    [/shuffle your deck/gi,                    'shuffle deck'],
    [/from your waiting room/gi,               'from WR'],
    [/into your waiting room/gi,               '→WR'],
    [/into your clock/gi,                      '→clock'],
    [/into your memory/gi,                     '→mem'],
    [/into your stock/gi,                      '→stock'],
    [/into your hand/gi,                       '→hand'],
    [/put into your waiting room/gi,           '→WR'],
    [/put into your clock/gi,                  '→clock'],
    [/put into your memory/gi,                 '→mem'],
    [/put into your stock/gi,                  '→stock'],
    [/put into your hand/gi,                   '→hand'],
    [/your battle opponent/gi,                 'B.opp'],
    [/battle opponent/gi,                      'B.opp'],
    [/during your opponent's turn/gi,          "opp's turn"],
    [/during your turn/gi,                     'your turn'],
    [/your opponent's/gi,                      "opp's"],
    [/your opponent/gi,                        'opp'],
    [/waiting room/gi,                         'WR'],
    [/character/gi,                            'char'],
    [/opponent/gi,                             'opp'],
    [/\btrigger\b/gi,                          'TRG'],
    [/\blevel\b/gi,                            'Lv'],
    [/\bpower\b/gi,                            'PWR'],
];

function shortenEffect(text) {
    if (!text) return text;
    let t = text;
    for (const [pattern, repl] of WS_SHORTEN) t = t.replace(pattern, repl);
    return t;
}

export default function WSSleeveInserts() {
    const [deckUrl, setDeckUrl] = useState('');
    const [deckName, setDeckName] = useState('');
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function handleFetch() {
        const url = deckUrl.trim();
        if (!url) return;
        setLoading(true);
        setError(null);
        setCards([]);
        try {
            const data = await fetchWsDeck(url);
            setDeckName(data.deckName ?? '');
            setCards(data.cards ?? []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    // One insert per copy of each card
    const inserts = cards.flatMap(card =>
        Array.from({ length: Math.max(1, card.quantity) }, (_, i) => ({ ...card, _key: `${card.serial}-${i}` }))
    );

    const insertCount = inserts.length;

    return (
        <div className="ws-page">
            <div className="ws-controls no-print">
                <h1 className="ws-title">WS Sleeve Inserts</h1>
                <p className="ws-hint">
                    Paste a deck URL from <strong>encoredecks.com</strong> or <strong>decklog.bushiroad.com</strong> to generate
                    printable translation inserts sized for the Weiss Schwarz card text frame.
                </p>
                <div className="ws-input-row">
                    <Input
                        className="ws-url-input"
                        placeholder="https://www.encoredecks.com/deck/... or https://decklog.bushiroad.com/view/..."
                        value={deckUrl}
                        onChange={e => setDeckUrl(e.target.value)}
                        onPressEnter={handleFetch}
                        disabled={loading}
                    />
                    <Button type="primary" onClick={handleFetch} loading={loading} disabled={!deckUrl.trim()}>
                        Generate
                    </Button>
                </div>
                {error && <Alert type="error" message={error} showIcon />}
                {insertCount > 0 && (
                    <div className="ws-deck-bar">
                        <span className="ws-deck-name">{deckName}</span>
                        <span className="ws-insert-count">{insertCount} inserts</span>
                        <Button onClick={() => window.print()}>Print</Button>
                    </div>
                )}
            </div>

            {loading && (
                <div className="ws-loading no-print">
                    <Spin size="large" tip="Fetching deck…" />
                </div>
            )}

            {insertCount > 0 && (
                <div className="ws-grid">
                    {inserts.map(card => (
                        <div className="ws-insert" key={card._key}>
                            <div className="ws-insert-header">
                                <span className="ws-insert-name">{card.name || card.serial}</span>
                                {card.serial && <span className="ws-insert-serial">{card.serial}</span>}
                            </div>
                            {card.traits && (
                                <div className="ws-insert-traits">{shortenEffect(card.traits)}</div>
                            )}
                            <div className="ws-insert-effect">{shortenEffect(card.effect) || '—'}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
