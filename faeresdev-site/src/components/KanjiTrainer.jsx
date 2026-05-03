import React, { useState, useEffect, useCallback } from "react";
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

function getRandomIndex(dataset, excludedIndex = -1) {
    let idx = Math.floor(Math.random() * dataset.length);
    while (dataset.length > 1 && idx === excludedIndex) {
        idx = Math.floor(Math.random() * dataset.length);
    }
    return idx;
}

function buildDistractors(dataset, correctIdx, step) {
    const correctValue = dataset[correctIdx][step];
    const pool = [correctIdx];
    const usedValues = new Set([correctValue]);

    for (let attempts = 0; attempts < 200 && pool.length < 3; attempts++) {
        const candidate = Math.floor(Math.random() * dataset.length);
        const candidateValue = dataset[candidate][step];
        if (!pool.includes(candidate) && !usedValues.has(candidateValue)) {
            pool.push(candidate);
            usedValues.add(candidateValue);
        }
    }

    for (let i = 0; pool.length < 3 && i < dataset.length; i++) {
        if (!pool.includes(i)) pool.push(i);
    }

    return pool.sort(() => Math.random() - 0.5);
}

function renderAnswerContent(entry, step) {
    const value = entry[step];
    if (step === "kanji") {
        return <span className="kanji-answer-main kanji-answer-main-symbol">{value}</span>;
    }
    if (step === "kun" || step === "on") {
        return <span className="kanji-answer-main kanji-answer-main-kana">{value}</span>;
    }
    return <span className="kanji-answer-main">{value}</span>;
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
    const [{ kanjiIdx, answers }, setQuestionState] = useState(() => {
        const ki = getRandomIndex(KANJI_SET);
        return { kanjiIdx: ki, answers: buildDistractors(KANJI_SET, ki, STEPS_FOR_MODE["kanji-to-translation"][0]) };
    });
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState({ correct: 0, total: 0 });

    useEffect(() => {
        listDecks()
            .then(decks => setAvailableDecks(decks.filter(d => d.type === "kanji")))
            .catch(() => setAvailableDecks(null));
    }, []);

    const resetQuiz = useCallback((newDataset, mode) => {
        const steps = STEPS_FOR_MODE[mode];
        const ki = getRandomIndex(newDataset);
        setQuestionState({ kanjiIdx: ki, answers: buildDistractors(newDataset, ki, steps[0]) });
        setStepIndex(0);
        setSelectedAnswer(null);
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
                const newDataset = deck.entries.length >= 3 ? deck.entries : KANJI_SET;
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
    const hasAnswered = selectedAnswer !== null;
    const isCorrect = selectedAnswer === kanjiIdx;
    const isLastStep = stepIndex === steps.length - 1;

    const scoreRatio = score.total > 0 ? score.correct / score.total : null;
    const scoreState = scoreRatio === null
        ? "is-neutral"
        : scoreRatio > 0.75 ? "is-strong"
        : scoreRatio >= 0.4 ? "is-neutral"
        : "is-weak";

    const handleAnswer = (answerIndex) => {
        if (hasAnswered) return;
        const correct = answerIndex === kanjiIdx;
        setSelectedAnswer(answerIndex);
        setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    };

    const goNext = () => {
        if (isLastStep) {
            const newKi = getRandomIndex(dataset, kanjiIdx);
            setQuestionState({ kanjiIdx: newKi, answers: buildDistractors(dataset, newKi, steps[0]) });
            setStepIndex(0);
        } else {
            const nextStepIdx = stepIndex + 1;
            setQuestionState(prev => ({
                ...prev,
                answers: buildDistractors(dataset, prev.kanjiIdx, steps[nextStepIdx]),
            }));
            setStepIndex(nextStepIdx);
        }
        setSelectedAnswer(null);
    };

    const switchQuizMode = (nextMode) => {
        const nextSteps = STEPS_FOR_MODE[nextMode];
        const ki = getRandomIndex(dataset, kanjiIdx);
        setQuizMode(nextMode);
        setQuestionState({ kanjiIdx: ki, answers: buildDistractors(dataset, ki, nextSteps[0]) });
        setStepIndex(0);
        setSelectedAnswer(null);
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
                            ? "A kanji is shown — choose the correct translation, then the Kun reading, then the On reading."
                            : "An English meaning is shown — choose the correct kanji, then the Kun reading, then the On reading."}
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

                    <div className="kanji-answers">
                        {answers.map((answerIndex) => {
                            const answerEntry = dataset[answerIndex];
                            let answerClass = "kanji-answer";

                            if (hasAnswered && answerIndex === selectedAnswer) {
                                answerClass += isCorrect ? " is-correct" : " is-wrong";
                            }
                            if (hasAnswered && !isCorrect && answerIndex === kanjiIdx) {
                                answerClass += " reveal-correct";
                            }

                            return (
                                <button
                                    key={`${answerEntry.kanji}-${answerIndex}-${currentStep}`}
                                    className={answerClass}
                                    onClick={() => handleAnswer(answerIndex)}
                                    disabled={hasAnswered}
                                    type="button"
                                >
                                    {renderAnswerContent(answerEntry, currentStep)}
                                </button>
                            );
                        })}
                    </div>

                    <div className="kanji-feedback">
                        {hasAnswered ? (
                            isCorrect ? (
                                <p className="kanji-feedback-text feedback-correct">Correct!</p>
                            ) : (
                                <p className="kanji-feedback-text feedback-wrong">
                                    Wrong. Correct answer: <strong>{currentKanji[currentStep]}</strong>
                                </p>
                            )
                        ) : (
                            <p className="kanji-feedback-text">Choose one answer.</p>
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
