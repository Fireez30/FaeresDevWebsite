import React, { useState, useEffect, useCallback, useRef } from "react";
import "./KanjiTrainer.css";
import { KANJI_SET, KANJI_SET_NOTE } from "../data/kanjiTrainingData.js";
import { listDecks, getDeck } from "../api/decksApi.js";

const STEPS_FOR_MODE = {
    "kanji-to-translation": ["translation", "kun", "on"],
    "translation-to-kanji": ["kanji", "kun", "on"],
};

const STEP_LABEL = {
    translation: "What does this kanji mean?",
    kun: "What is the Kun reading?",
    on: "What is the On reading?",
    kanji: "Which kanji matches this translation?",
};

const STEP_NAME = {
    translation: "Translation",
    kun: "Kun Reading",
    on: "On Reading",
    kanji: "Kanji",
};

const STEP_PLACEHOLDER = {
    translation: "Type the English meaning…",
    kun: "Type the kun reading…",
    on: "Type the on reading…",
    kanji: "Type the kanji character…",
};

function getRandomIndex(dataset, excludedIndex = -1) {
    let idx = Math.floor(Math.random() * dataset.length);
    while (dataset.length > 1 && idx === excludedIndex) {
        idx = Math.floor(Math.random() * dataset.length);
    }
    return idx;
}

function DeckSelector({ availableDecks, activeDeckId, onSelect }) {
    if (availableDecks === null) return null;
    return (
        <div className="kanji-deck-selector">
            <label className="kanji-deck-label">Deck</label>
            <select
                className="kanji-deck-select"
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

function KanjiTrainer() {
    const [availableDecks, setAvailableDecks] = useState(null);
    const [activeDeckId, setActiveDeckId] = useState(null);
    const [dataset, setDataset] = useState(KANJI_SET);

    const [quizMode, setQuizMode] = useState("kanji-to-translation");
    const [stepIndex, setStepIndex] = useState(0);
    const [kanjiIdx, setKanjiIdx] = useState(() => getRandomIndex(KANJI_SET));
    const [typedAnswer, setTypedAnswer] = useState("");
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const inputRef = useRef(null);

    useEffect(() => {
        listDecks()
            .then(decks => setAvailableDecks(decks.filter(d => d.type === "kanji")))
            .catch(() => setAvailableDecks(null));
    }, []);

    const resetQuiz = useCallback((newDataset, mode) => {
        setKanjiIdx(getRandomIndex(newDataset));
        setStepIndex(0);
        setTypedAnswer("");
        setHasSubmitted(false);
        setScore({ correct: 0, total: 0 });
    }, []);

    const handleDeckSelect = async (deckId) => {
        setActiveDeckId(deckId);
        if (!deckId) {
            setDataset(KANJI_SET);
            resetQuiz(KANJI_SET, quizMode);
        } else {
            try {
                const deck = await getDeck(deckId);
                const newDataset = deck.entries.length >= 1 ? deck.entries : KANJI_SET;
                setDataset(newDataset);
                resetQuiz(newDataset, quizMode);
            } catch {
                setDataset(KANJI_SET);
                resetQuiz(KANJI_SET, quizMode);
            }
        }
    };

    const steps = STEPS_FOR_MODE[quizMode];
    const currentStep = steps[stepIndex];
    const currentKanji = dataset[kanjiIdx];
    const isLastStep = stepIndex === steps.length - 1;
    const correctText = currentKanji[currentStep];
    const isCorrect = hasSubmitted && typedAnswer.trim().toLowerCase() === correctText.toLowerCase();

    const scoreRatio = score.total > 0 ? score.correct / score.total : null;
    const scoreState = scoreRatio === null
        ? "is-neutral"
        : scoreRatio > 0.75 ? "is-strong"
        : scoreRatio >= 0.4 ? "is-neutral"
        : "is-weak";

    const handleSubmit = () => {
        if (hasSubmitted || !typedAnswer.trim()) return;
        const correct = typedAnswer.trim().toLowerCase() === correctText.toLowerCase();
        setHasSubmitted(true);
        setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    };

    const goNext = () => {
        if (isLastStep) {
            setKanjiIdx(getRandomIndex(dataset, kanjiIdx));
            setStepIndex(0);
        } else {
            setStepIndex(stepIndex + 1);
        }
        setTypedAnswer("");
        setHasSubmitted(false);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const switchQuizMode = (nextMode) => {
        setQuizMode(nextMode);
        setKanjiIdx(getRandomIndex(dataset, kanjiIdx));
        setStepIndex(0);
        setTypedAnswer("");
        setHasSubmitted(false);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const promptContent = quizMode === "kanji-to-translation" ? currentKanji.kanji : currentKanji.translation;
    const isTranslationPrompt = quizMode === "translation-to-kanji";
    const usingBuiltIn = !activeDeckId;

    return (
        <div className="kanji-page">
            <section className="kanji-shell">
                <div className="kanji-copy">
                    <h1>Kanji Trainer</h1>
                    <p className="kanji-subtitle">
                        {quizMode === "kanji-to-translation"
                            ? "A kanji is shown — type the translation, then the Kun reading, then the On reading."
                            : "An English meaning is shown — type the kanji, then the Kun reading, then the On reading."}
                    </p>
                    <DeckSelector
                        availableDecks={availableDecks}
                        activeDeckId={activeDeckId}
                        onSelect={handleDeckSelect}
                    />
                    <div className="kanji-mode-switch">
                        <button
                            className={`kanji-mode-button ${quizMode === "kanji-to-translation" ? "is-active" : ""}`}
                            onClick={() => switchQuizMode("kanji-to-translation")}
                            type="button"
                        >
                            Kanji to Translation
                        </button>
                        <button
                            className={`kanji-mode-button ${quizMode === "translation-to-kanji" ? "is-active" : ""}`}
                            onClick={() => switchQuizMode("translation-to-kanji")}
                            type="button"
                        >
                            Translation to Kanji
                        </button>
                    </div>
                    {usingBuiltIn && (
                        <p className="kanji-maintenance-note">
                            {KANJI_SET_NOTE} File: <strong>src/data/kanjiTrainingData.js</strong>
                        </p>
                    )}
                </div>

                <div className="kanji-card">
                    <div className={`kanji-score kanji-score-main ${scoreState}`}>
                        Score: <strong>{score.correct} / {score.total}</strong>
                    </div>

                    <div className="kanji-step-indicator">
                        <div className="kanji-step-dots">
                            {steps.map((step, i) => (
                                <span
                                    key={step}
                                    className={`kanji-step-dot ${i === stepIndex ? "is-active" : ""} ${i < stepIndex ? "is-done" : ""}`}
                                />
                            ))}
                        </div>
                        <span className="kanji-step-text">
                            Step {stepIndex + 1}/{steps.length} — {STEP_NAME[currentStep]}
                        </span>
                    </div>

                    <div className="kanji-prompt">
                        <span className="kanji-label">{STEP_LABEL[currentStep]}</span>
                        <div className={`kanji-symbol ${isTranslationPrompt ? "is-translation-prompt" : ""}`}>
                            {promptContent}
                        </div>
                    </div>

                    <div className="kanji-text-input-row">
                        <input
                            ref={inputRef}
                            type="text"
                            className="kanji-text-input"
                            value={typedAnswer}
                            onChange={e => !hasSubmitted && setTypedAnswer(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSubmit()}
                            disabled={hasSubmitted}
                            placeholder={STEP_PLACEHOLDER[currentStep]}
                            autoFocus
                        />
                        <button
                            className="kanji-submit-btn"
                            onClick={handleSubmit}
                            disabled={hasSubmitted || !typedAnswer.trim()}
                            type="button"
                        >
                            Submit
                        </button>
                    </div>

                    <div className="kanji-feedback">
                        {hasSubmitted ? (
                            isCorrect ? (
                                <p className="kanji-feedback-text feedback-correct">Correct!</p>
                            ) : (
                                <p className="kanji-feedback-text feedback-wrong">
                                    Wrong. Correct answer: <strong>{correctText}</strong>
                                </p>
                            )
                        ) : (
                            <p className="kanji-feedback-text">Type your answer and press Enter.</p>
                        )}
                    </div>

                    <button className="kanji-next-button" onClick={goNext} type="button">
                        {isLastStep ? "Next Kanji" : "Next Step"}
                    </button>
                </div>
            </section>
        </div>
    );
}

export default KanjiTrainer;
