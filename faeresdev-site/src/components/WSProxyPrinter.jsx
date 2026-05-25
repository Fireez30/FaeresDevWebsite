import React, { useState, useMemo, useRef } from 'react';
import { Button, Input, Spin, Alert, Tabs, InputNumber, Slider } from 'antd';
import { fetchWsProxyDeck } from '../api/wsApi.js';
import './WSProxyPrinter.css';

export default function WSProxyPrinter() {
    const [mode, setMode] = useState('url');

    // URL mode
    const [deckUrl, setDeckUrl] = useState('');
    const [deckName, setDeckName] = useState('');
    const [importedCards, setImportedCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Manual mode
    const [manualCards, setManualCards] = useState([]);

    // Layout
    const [cardGap, setCardGap] = useState(30);
    const fileInputRef = useRef(null);

    async function handleFetch() {
        const url = deckUrl.trim();
        if (!url) return;
        setLoading(true);
        setError(null);
        setImportedCards([]);
        try {
            const data = await fetchWsProxyDeck(url);
            setDeckName(data.deckName ?? '');
            setImportedCards(data.cards ?? []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function handleFileAdd(e) {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = ev => {
                setManualCards(prev => [...prev, {
                    id: crypto.randomUUID(),
                    imageUrl: ev.target.result,
                    name: file.name.replace(/\.[^.]+$/, ''),
                    quantity: 1,
                }]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    }

    function updateQty(id, quantity) {
        setManualCards(prev => prev.map(c => c.id === id ? { ...c, quantity: quantity ?? 1 } : c));
    }

    function removeCard(id) {
        setManualCards(prev => prev.filter(c => c.id !== id));
    }

    function updateImportedQty(serial, quantity) {
        setImportedCards(prev => prev.map(c => c.serial === serial ? { ...c, quantity: quantity ?? 1 } : c));
    }

    // Expand cards by quantity
    const proxies = useMemo(() => {
        const source = mode === 'url' ? importedCards : manualCards;
        return source.flatMap((card, idx) =>
            Array.from({ length: Math.max(1, card.quantity || 1) }, (_, i) => ({
                ...card,
                _key: `${idx}-${i}`,
            }))
        );
    }, [mode, importedCards, manualCards]);

    // Group into pages of 9
    const pages = useMemo(() => {
        const result = [];
        for (let i = 0; i < proxies.length; i += 9) result.push(proxies.slice(i, i + 9));
        return result;
    }, [proxies]);

    function cardImgSrc(card) {
        if (!card.imageUrl && !card.serial) return null;
        if (card.imageUrl?.startsWith('data:')) return card.imageUrl;
        const params = new URLSearchParams();
        if (card.serial) params.set('serial', card.serial);
        if (card.imageUrl) params.set('fallback', card.imageUrl);
        return `/api/ws-image-best?${params}`;
    }

    const tabItems = [
        { key: 'url', label: 'Import from encore deck' },
        { key: 'manual', label: 'Upload your cards' },
    ];

    return (
        <div className="proxy-page">
            <div className="proxy-controls no-print">
                <h1 className="proxy-title">WS Proxy Printer</h1>
                <p className="proxy-hint">
                    Generate ready-to-print proxies for a deck or a list of card. Use encoredecks or import images
                </p>

                <Tabs activeKey={mode} onChange={setMode} items={tabItems} />

                {mode === 'url' && (
                    <div className="proxy-url-section">
                        <div className="proxy-input-row">
                            <Input
                                className="proxy-url-input"
                                placeholder="https://www.encoredecks.com/deck/…"
                                value={deckUrl}
                                onChange={e => setDeckUrl(e.target.value)}
                                onPressEnter={handleFetch}
                                disabled={loading}
                            />
                            <Button type="primary" onClick={handleFetch} loading={loading} disabled={!deckUrl.trim()}>
                                Import
                            </Button>
                        </div>

                        {error && <Alert type="error" message={error} showIcon style={{ marginTop: 8 }} />}

                        {loading && (
                            <div className="proxy-loading">
                                <Spin size="large" tip="Fetching deck" />
                            </div>
                        )}

                        {importedCards.length > 0 && (
                            <>
                                <div className="proxy-deck-bar">
                                    <span className="proxy-deck-name">{deckName}</span>
                                    <span className="proxy-count-label">
                                        {importedCards.length} cards · {proxies.length} proxy
                                    </span>
                                </div>
                                <div className="proxy-imported-list">
                                    {importedCards.map(card => (
                                        <div className="proxy-imported-row" key={card.serial}>
                                            {cardImgSrc(card) ? (
                                                <img
                                                    className="proxy-thumb"
                                                    src={cardImgSrc(card)}
                                                    alt={card.name}
                                                />
                                            ) : (
                                                <div className="proxy-thumb proxy-thumb-empty">?</div>
                                            )}
                                            <span className="proxy-imported-name">{card.name || card.serial}</span>
                                            <span className="proxy-imported-serial">{card.serial}</span>
                                            <div className="proxy-qty-row">
                                                <span>×</span>
                                                <InputNumber
                                                    min={0}
                                                    max={50}
                                                    value={card.quantity}
                                                    onChange={v => updateImportedQty(card.serial, v)}
                                                    size="small"
                                                    style={{ width: 56 }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {mode === 'manual' && (
                    <div className="proxy-manual-section">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            style={{ display: 'none' }}
                            onChange={handleFileAdd}
                        />

                        {manualCards.length === 0 && (
                            <p className="proxy-empty-hint">
                                No cards added, add them with "+"
                            </p>
                        )}

                        {manualCards.length > 0 && (
                            <div className="proxy-manual-list">
                                {manualCards.map(card => (
                                    <div className="proxy-manual-row" key={card.id}>
                                        <img className="proxy-thumb" src={card.imageUrl} alt={card.name} />
                                        <span className="proxy-manual-name">{card.name}</span>
                                        <div className="proxy-qty-row">
                                            <span>Count :</span>
                                            <InputNumber
                                                min={1}
                                                max={50}
                                                value={card.quantity}
                                                onChange={v => updateQty(card.id, v)}
                                                size="small"
                                                style={{ width: 56 }}
                                            />
                                        </div>
                                        <Button
                                            size="small"
                                            danger
                                            onClick={() => removeCard(card.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="proxy-manual-actions">
                            <Button onClick={() => fileInputRef.current?.click()}>
                                + Add cards
                            </Button>
                            {manualCards.length > 0 && (
                                <span className="proxy-count-label">
                                    {manualCards.length} cards · {proxies.length} proxy
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {proxies.length > 0 && (
                    <div className="proxy-print-bar">
                        <Button type="primary" size="large" onClick={() => window.print()}>
                            Print / Save to pdf
                        </Button>
                        <span className="proxy-count-label">
                            {pages.length} page{pages.length > 1 ? 's' : ''} · 9 proxies / page
                        </span>
                        <div className="proxy-gap-control">
                            <span className="proxy-gap-label">Écart : {cardGap}px</span>
                            <Slider
                                min={1}
                                max={50}
                                value={cardGap}
                                onChange={setCardGap}
                                style={{ width: 140 }}
                                tooltip={{ formatter: v => `${v}px` }}
                            />
                        </div>
                    </div>
                )}
            </div>
            {pages.map((page, pi) => (
                <div className="proxy-sheet" key={pi} style={{ gap: `${cardGap}px` }}>
                    {page.map(card => (
                        <div className="proxy-card" key={card._key}>
                            {cardImgSrc(card) ? (
                                <img
                                    src={cardImgSrc(card)}
                                    className={card.isClimax ? 'proxy-img is-climax' : 'proxy-img'}
                                    alt={card.name ?? card.serial ?? ''}
                                    loading="lazy"
                                />
                            ) : (
                                <div className="proxy-placeholder">
                                    <span>{card.name ?? card.serial ?? '?'}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
