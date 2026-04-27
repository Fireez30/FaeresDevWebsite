import React, { useState } from "react";
import "./VocabularyTrainer.css";
import { VOCAB_SET, VOCAB_SET_NOTE } from "../data/vocabularyTrainingData.js";

function getRandomIndex(excludedIndex = -1) {
    let idx = Math.floor(Math.random() * VOCAB_SET.length);
    while (VOCAB_SET.length > 1 && idx === excludedIndex) {
        idx = Math.floor(Math.random() * VOCAB_SET.length);
    }
    return idx;
}

function buildQuestion(excludeIdx = -1) {
    const correctIdx = getRandomIndex(excludeIdx);
    const pool = [correctIdx];
    while (pool.length < 3) {
        const candidate = Math.floor(Math.random() * VOCAB_SET.length);
        if (!pool.includes(candidate)) pool.push(candidate);
    }
    return { correctIdx, answers: pool.sort(() => Math.random() - 0.5) };
}

function VocabularyTrainer() {
    const [quizMode, setQuizMode] = useState("vocab-to-translation");
    const [question, setQuestion] = useState(() => buildQuestion());
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState({ correct: 0, total: 0 });

    const { correctIdx, answers } = question;
    const currentEntry = VOCAB_SET[correctIdx];
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
        setQuestion(buildQuestion(correctIdx));
        setSelectedAnswer(null);
    };

    const switchQuizMode = (nextMode) => {
        setQuizMode(nextMode);
        setQuestion(buildQuestion(correctIdx));
        setSelectedAnswer(null);
    };

    const isVocabToTranslation = quizMode === "vocab-to-translation";
    const promptText = isVocabToTranslation ? currentEntry.japanese : currentEntry.translation;

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
                    <p className="vocab-maintenance-note">
                        {VOCAB_SET_NOTE} <strong>src/data/vocabularyTrainingData.js</strong>
                    </p>
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
                            const entry = VOCAB_SET[answerIndex];
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
