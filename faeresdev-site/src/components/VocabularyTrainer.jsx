import React, { useState, useEffect, useCallback } from "react";
import "./VocabularyTrainer.css";
import { VOCAB_SET, VOCAB_SET_NOTE } from "../data/vocabularyTrainingData.js";
import { listDecks, getDeck } from "../api/decksApi.js";

function getRandomIndex(dataset, excludedIndex = -1) {
    let idx = Math.floor(Math.random() * dataset.length);
    while (dataset.length > 1 && idx === excludedIndex) {
        idx = Math.floor(Math.random() * dataset.length);
    }
    return idx;
}

function buildQuestion(dataset, excludeIdx = -1) {
    const correctIdx = getRandomIndex(dataset, excludeIdx);
    const pool = [correctIdx];
    while (pool.length < 3) {
        const candidate = Math.floor(Math.random() * dataset.length);
        if (!pool.includes(candidate)) pool.push(candidate);
    }
    return { correctIdx, answers: pool.sort(() => Math.random() - 0.5) };
}

function DeckSelector({ availableDecks, activeDeckId, onSelect }) {
    if (availableDecks === null) return null;
    return (
        <div className="vocab-deck-selector">
            <label className="vocab-deck-label">Deck</label>
            <select
                className="vocab-deck-select"
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

function VocabularyTrainer() {
    const [availableDecks, setAvailableDecks] = useState(null);
    const [activeDeckId, setActiveDeckId] = useState(null);
    const [dataset, setDataset] = useState(VOCAB_SET);

    const [quizMode, setQuizMode] = useState("vocab-to-translation");
    const [question, setQuestion] = useState(() => buildQuestion(VOCAB_SET));
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState({ correct: 0, total: 0 });

    useEffect(() => {
        listDecks()
            .then(decks => setAvailableDecks(decks.filter(d => d.type === "vocabulary")))
            .catch(() => setAvailableDecks(null));
    }, []);

    const resetQuiz = useCallback((newDataset) => {
        setQuestion(buildQuestion(newDataset));
        setSelectedAnswer(null);
        setScore({ correct: 0, total: 0 });
    }, []);

    const handleDeckSelect = async (deckId) => {
        setActiveDeckId(deckId);
        if (!deckId) {
            setDataset(VOCAB_SET);
            resetQuiz(VOCAB_SET);
        } else {
            try {
                const deck = await getDeck(deckId);
                const newDataset = deck.entries.length >= 3 ? deck.entries : VOCAB_SET;
                setDataset(newDataset);
                resetQuiz(newDataset);
            } catch {
                setDataset(VOCAB_SET);
                resetQuiz(VOCAB_SET);
            }
        }
    };

    const { correctIdx, answers } = question;
    const currentEntry = dataset[correctIdx];
    const hasAnswered = selectedAnswer !== null;
    const isCorrect = selectedAnswer === correctIdx;

    const scoreRatio = score.total > 0 ? score.correct / score.total : null;
    const scoreState = scoreRatio === null
        ? "is-neutral"
        : scoreRatio > 0.75 ? "is-strong"
        : scoreRatio >= 0.4 ? "is-neutral"
        : "is-weak";

    const handleAnswer = (answerIndex) => {
        if (hasAnswered) return;
        const correct = answerIndex === correctIdx;
        setSelectedAnswer(answerIndex);
        setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    };

    const goNext = () => {
        setQuestion(buildQuestion(dataset, correctIdx));
        setSelectedAnswer(null);
    };

    const switchQuizMode = (nextMode) => {
        setQuizMode(nextMode);
        setQuestion(buildQuestion(dataset, correctIdx));
        setSelectedAnswer(null);
    };

    const isVocabToTranslation = quizMode === "vocab-to-translation";
    const promptText = isVocabToTranslation ? currentEntry.japanese : currentEntry.translation;
    const usingBuiltIn = !activeDeckId;

    return (
        <div className="vocab-page">
            <section className="vocab-shell">
                <div className="vocab-copy">
                    <h1>Vocabulary Trainer</h1>
                    <p className="vocab-subtitle">
                        {isVocabToTranslation
                            ? "A Japanese word or phrase is shown — choose the correct English translation."
                            : "An English translation is shown — choose the correct Japanese word or phrase."}
                    </p>
                    <DeckSelector
                        availableDecks={availableDecks}
                        activeDeckId={activeDeckId}
                        onSelect={handleDeckSelect}
                    />
                    <div className="vocab-mode-switch">
                        <button
                            className={`vocab-mode-button ${quizMode === "vocab-to-translation" ? "is-active" : ""}`}
                            onClick={() => switchQuizMode("vocab-to-translation")}
                            type="button"
                        >
                            Japanese to Translation
                        </button>
                        <button
                            className={`vocab-mode-button ${quizMode === "translation-to-vocab" ? "is-active" : ""}`}
                            onClick={() => switchQuizMode("translation-to-vocab")}
                            type="button"
                        >
                            Translation to Japanese
                        </button>
                    </div>
                    {usingBuiltIn && (
                        <p className="vocab-maintenance-note">
                            {VOCAB_SET_NOTE} <strong>src/data/vocabularyTrainingData.js</strong>
                        </p>
                    )}
                </div>

                <div className="vocab-card">
                    <div className={`vocab-score ${scoreState}`}>
                        Score: <strong>{score.correct} / {score.total}</strong>
                    </div>

                    <div className="vocab-prompt">
                        <span className="vocab-label">
                            {isVocabToTranslation
                                ? "What does this mean?"
                                : "Which Japanese matches this translation?"}
                        </span>
                        <div className={`vocab-prompt-box ${isVocabToTranslation ? "is-japanese" : "is-translation"}`}>
                            {promptText}
                        </div>
                    </div>

                    <div className="vocab-answers">
                        {answers.map((answerIndex) => {
                            const entry = dataset[answerIndex];
                            const answerText = isVocabToTranslation ? entry.translation : entry.japanese;
                            let cls = "vocab-answer";

                            if (hasAnswered && answerIndex === selectedAnswer) {
                                cls += isCorrect ? " is-correct" : " is-wrong";
                            }
                            if (hasAnswered && !isCorrect && answerIndex === correctIdx) {
                                cls += " reveal-correct";
                            }

                            return (
                                <button
                                    key={`${entry.japanese}-${answerIndex}`}
                                    className={cls}
                                    onClick={() => handleAnswer(answerIndex)}
                                    disabled={hasAnswered}
                                    type="button"
                                >
                                    <span className={`vocab-answer-text ${!isVocabToTranslation ? "is-japanese" : ""}`}>
                                        {answerText}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="vocab-feedback">
                        {hasAnswered ? (
                            isCorrect ? (
                                <p className="vocab-feedback-text feedback-correct">Correct!</p>
                            ) : (
                                <p className="vocab-feedback-text feedback-wrong">
                                    Wrong. Correct answer:{" "}
                                    <strong>
                                        {isVocabToTranslation ? currentEntry.translation : currentEntry.japanese}
                                    </strong>
                                </p>
                            )
                        ) : (
                            <p className="vocab-feedback-text">Choose one answer.</p>
                        )}
                    </div>

                    <button className="vocab-next-button" onClick={goNext} type="button">
                        Next
                    </button>
                </div>
            </section>
        </div>
    );
}

export default VocabularyTrainer;
