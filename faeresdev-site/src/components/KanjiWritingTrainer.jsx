import React, { useState, useRef, useEffect, useCallback } from "react";
import "./KanjiWritingTrainer.css";
import { KANJI_SET } from "../data/kanjiTrainingData.js";
import { listDecks, getDeck } from "../api/decksApi.js";

const CANVAS_SIZE = 220;

function getMainKanji(kanjiStr) {
    for (const char of kanjiStr) {
        const cp = char.codePointAt(0);
        if ((cp >= 0x4e00 && cp <= 0x9fff) || (cp >= 0x3400 && cp <= 0x4dbf)) return char;
    }
    return kanjiStr[0];
}

function getStrokeOrderUrl(kanjiStr) {
    const main = getMainKanji(kanjiStr);
    const hex = main.codePointAt(0).toString(16).padStart(5, "0");
    return `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg/kanji/${hex}.svg`;
}

function getRandomIndex(dataset, excluded = -1) {
    let idx = Math.floor(Math.random() * dataset.length);
    while (dataset.length > 1 && idx === excluded) {
        idx = Math.floor(Math.random() * dataset.length);
    }
    return idx;
}

function buildQuestion(dataset, previousIndex = -1) {
    const correctIndex = getRandomIndex(dataset, previousIndex);
    const distractors = [];
    while (distractors.length < 2) {
        const idx = getRandomIndex(dataset, previousIndex);
        if (idx !== correctIndex && !distractors.includes(idx)) {
            distractors.push(idx);
        }
    }
    const kunOptions = [correctIndex, ...distractors].sort(() => Math.random() - 0.5);
    return { correctIndex, kunOptions };
}

function DeckSelector({ availableDecks, activeDeckId, onSelect }) {
    if (availableDecks === null) return null;
    return (
        <div className="kwt-deck-selector">
            <label className="kwt-deck-label">Deck</label>
            <select
                className="kwt-deck-select"
                value={activeDeckId ?? ""}
                onChange={e => onSelect(e.target.value || null)}
            >
                <option value="">Default (built-in)</option>
                {availableDecks.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.entryCount} entries)</option>
                ))}
            </select>
        </div>
    );
}

function KanjiWritingTrainer() {
    const [availableDecks, setAvailableDecks] = useState(null);
    const [activeDeckId, setActiveDeckId] = useState(null);
    const [dataset, setDataset] = useState(KANJI_SET);

    const [question, setQuestion] = useState(() => buildQuestion(KANJI_SET));
    const [selectedKun, setSelectedKun] = useState(null);
    const [isValidated, setIsValidated] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [strokeCount, setStrokeCount] = useState(0);
    const [svgError, setSvgError] = useState(false);

    const canvasRef = useRef(null);
    const strokesRef = useRef([]);
    const currentStrokeRef = useRef(null);
    const isDrawingRef = useRef(false);

    useEffect(() => {
        listDecks()
            .then(decks => setAvailableDecks(decks.filter(d => d.type === "kanji")))
            .catch(() => setAvailableDecks(null));
    }, []);

    const resetQuiz = useCallback((newDataset) => {
        setQuestion(buildQuestion(newDataset));
        setSelectedKun(null);
        setIsValidated(false);
        setSvgError(false);
        setScore({ correct: 0, total: 0 });
    }, []);

    const handleDeckSelect = async (deckId) => {
        setActiveDeckId(deckId);
        if (!deckId) {
            setDataset(KANJI_SET);
            resetQuiz(KANJI_SET);
        } else {
            try {
                const deck = await getDeck(deckId);
                const newDataset = deck.entries.length >= 3 ? deck.entries : KANJI_SET;
                setDataset(newDataset);
                resetQuiz(newDataset);
            } catch {
                setDataset(KANJI_SET);
                resetQuiz(KANJI_SET);
            }
        }
    };

    const currentKanji = dataset[question.correctIndex];
    const hasDrawn = strokeCount > 0;
    const canValidate = selectedKun !== null && hasDrawn;
    const isKunCorrect = isValidated && selectedKun === question.correctIndex;

    const scoreRatio = score.total > 0 ? score.correct / score.total : null;
    const scoreState =
        scoreRatio === null ? "is-neutral" :
        scoreRatio > 0.75 ? "is-strong" :
        scoreRatio >= 0.4 ? "is-neutral" : "is-weak";

    const redrawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        ctx.save();
        ctx.strokeStyle = "rgba(0,0,0,0.12)";
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(CANVAS_SIZE / 2, 4);
        ctx.lineTo(CANVAS_SIZE / 2, CANVAS_SIZE - 4);
        ctx.moveTo(4, CANVAS_SIZE / 2);
        ctx.lineTo(CANVAS_SIZE - 4, CANVAS_SIZE / 2);
        ctx.stroke();
        ctx.restore();

        ctx.strokeStyle = "#1a1a2e";
        ctx.lineWidth = 3.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (const stroke of strokesRef.current) {
            if (stroke.length < 2) continue;
            ctx.beginPath();
            ctx.moveTo(stroke[0].x, stroke[0].y);
            for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
            ctx.stroke();
        }
    };

    useEffect(() => {
        strokesRef.current = [];
        currentStrokeRef.current = null;
        isDrawingRef.current = false;
        setStrokeCount(0);
        requestAnimationFrame(redrawCanvas);
    }, [question]);

    const getPos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const source = e.touches ? e.touches[0] : e;
        return {
            x: (source.clientX - rect.left) * (CANVAS_SIZE / rect.width),
            y: (source.clientY - rect.top) * (CANVAS_SIZE / rect.height),
        };
    };

    const onPointerDown = (e) => {
        if (isValidated) return;
        e.preventDefault();
        isDrawingRef.current = true;
        currentStrokeRef.current = [getPos(e)];
    };

    const onPointerMove = (e) => {
        if (!isDrawingRef.current || isValidated) return;
        e.preventDefault();
        const pos = getPos(e);
        const stroke = currentStrokeRef.current;
        stroke.push(pos);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (stroke.length >= 2) {
            ctx.strokeStyle = "#1a1a2e";
            ctx.lineWidth = 3.5;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            ctx.moveTo(stroke[stroke.length - 2].x, stroke[stroke.length - 2].y);
            ctx.lineTo(stroke[stroke.length - 1].x, stroke[stroke.length - 1].y);
            ctx.stroke();
        }
    };

    const onPointerUp = () => {
        if (!isDrawingRef.current) return;
        isDrawingRef.current = false;
        const stroke = currentStrokeRef.current;
        if (stroke && stroke.length > 0) {
            strokesRef.current.push([...stroke]);
            setStrokeCount((n) => n + 1);
        }
        currentStrokeRef.current = null;
    };

    const clearCanvas = () => {
        strokesRef.current = [];
        currentStrokeRef.current = null;
        isDrawingRef.current = false;
        setStrokeCount(0);
        redrawCanvas();
    };

    const handleValidate = () => {
        if (!canValidate) return;
        const correct = selectedKun === question.correctIndex;
        setIsValidated(true);
        setSvgError(false);
        setScore((s) => ({
            correct: s.correct + (correct ? 1 : 0),
            total: s.total + 1,
        }));
    };

    const goToNext = () => {
        setQuestion(buildQuestion(dataset, question.correctIndex));
        setSelectedKun(null);
        setIsValidated(false);
        setSvgError(false);
    };

    const feedbackMessage = !hasDrawn && selectedKun === null
        ? "Draw the kanji in the canvas and select a kun reading."
        : !hasDrawn
        ? "Draw the kanji in the canvas above."
        : selectedKun === null
        ? "Now select the correct kun reading."
        : "Ready — click Validate to check your answer.";

    return (
        <div className="kwt-page">
            <section className="kwt-shell">
                <div className="kwt-copy">
                    <h1>Kanji Writing Trainer</h1>
                    <p className="kwt-subtitle">
                        You are given the English meaning of a kanji. Draw the character in the
                        canvas, then select its kun reading. Click Validate to reveal the
                        correct stroke order.
                    </p>
                    <DeckSelector
                        availableDecks={availableDecks}
                        activeDeckId={activeDeckId}
                        onSelect={handleDeckSelect}
                    />
                    <div className={`kanji-score kanji-score-main ${scoreState}`}>
                        Score: <strong>{score.correct} / {score.total}</strong>
                    </div>
                </div>

                <div className="kwt-card">
                    <div className="kwt-prompt">
                        <span className="kanji-label">What kanji means…</span>
                        <div className="kwt-translation">{currentKanji.translation}</div>
                    </div>

                    <div className={`kwt-drawing-row ${isValidated ? "is-revealed" : ""}`}>
                        <div className="kwt-canvas-col">
                            <span className="kwt-col-label">Your drawing</span>
                            <canvas
                                ref={canvasRef}
                                className={`kwt-canvas ${isValidated ? "is-locked" : ""}`}
                                width={CANVAS_SIZE}
                                height={CANVAS_SIZE}
                                onMouseDown={onPointerDown}
                                onMouseMove={onPointerMove}
                                onMouseUp={onPointerUp}
                                onMouseLeave={onPointerUp}
                                onTouchStart={onPointerDown}
                                onTouchMove={onPointerMove}
                                onTouchEnd={onPointerUp}
                            />
                            {!isValidated && (
                                <button className="kwt-clear-btn" onClick={clearCanvas} type="button">
                                    Clear
                                </button>
                            )}
                        </div>

                        {isValidated && (
                            <div className="kwt-stroke-col">
                                <span className="kwt-col-label">Stroke order</span>
                                <div className="kwt-stroke-box">
                                    {!svgError ? (
                                        <img
                                            className="kwt-stroke-img"
                                            src={getStrokeOrderUrl(currentKanji.kanji)}
                                            alt={`Stroke order for ${currentKanji.kanji}`}
                                            onError={() => setSvgError(true)}
                                        />
                                    ) : (
                                        <span className="kwt-stroke-unavailable">
                                            Stroke order unavailable
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="kwt-kun-section">
                        <span className="kwt-section-label">Select the kun reading:</span>
                        <div className="kwt-kun-options">
                            {question.kunOptions.map((idx) => {
                                const entry = dataset[idx];
                                let cls = "kwt-kun-btn";
                                if (selectedKun === idx) cls += " is-selected";
                                if (isValidated) {
                                    if (idx === question.correctIndex) cls += " is-correct";
                                    else if (selectedKun === idx) cls += " is-wrong";
                                }
                                return (
                                    <button
                                        key={idx}
                                        className={cls}
                                        onClick={() => !isValidated && setSelectedKun(idx)}
                                        disabled={isValidated}
                                        type="button"
                                    >
                                        {entry.kun}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="kwt-feedback">
                        {isValidated ? (
                            <>
                                <p className={`kwt-feedback-text ${isKunCorrect ? "feedback-correct" : "feedback-wrong"}`}>
                                    {isKunCorrect
                                        ? <> Correct! The kun reading of <strong>{currentKanji.kanji}</strong> is <strong>{currentKanji.kun}</strong>.</>
                                        : <> Wrong. The correct kun reading is <strong>{currentKanji.kun}</strong> for <strong>{currentKanji.kanji}</strong>.</>
                                    }
                                </p>
                                <p className="kwt-feedback-text kwt-hint">
                                    Compare your drawing with the stroke order diagram.
                                </p>
                            </>
                        ) : (
                            <p className="kwt-feedback-text">{feedbackMessage}</p>
                        )}
                    </div>

                    {!isValidated ? (
                        <button
                            className="kwt-validate-btn"
                            onClick={handleValidate}
                            disabled={!canValidate}
                            type="button"
                        >
                            Validate
                        </button>
                    ) : (
                        <button className="kwt-next-btn" onClick={goToNext} type="button">
                            Next Kanji
                        </button>
                    )}
                </div>
            </section>
        </div>
    );
}

export default KanjiWritingTrainer;
