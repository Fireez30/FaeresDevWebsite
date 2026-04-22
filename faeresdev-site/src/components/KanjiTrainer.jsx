import React, { useState } from "react";
import "./KanjiTrainer.css";
import { KANJI_SET, KANJI_SET_NOTE } from "../data/kanjiTrainingData.js";

function getRandomIndex(excludedIndex = -1) {
    let nextIndex = Math.floor(Math.random() * KANJI_SET.length);
    while (KANJI_SET.length > 1 && nextIndex === excludedIndex) {
        nextIndex = Math.floor(Math.random() * KANJI_SET.length);
    }
    return nextIndex;
}

function buildQuestion(previousIndex = -1) {
    const correctIndex = getRandomIndex(previousIndex);
    const distractorIndexes = [];

    while (distractorIndexes.length < 2) {
        const candidateIndex = getRandomIndex(previousIndex);
        if (candidateIndex !== correctIndex && !distractorIndexes.includes(candidateIndex)) {
            distractorIndexes.push(candidateIndex);
        }
    }

    const answers = [correctIndex, distractorIndexes[0], distractorIndexes[1]].sort(() => Math.random() - 0.5);

    return {
        correctIndex,
        answers,
    };
}

function renderReadings(entry) {
    return `Kun: ${entry.kun} | On: ${entry.on}`;
}

function renderTranslationAnswer(entry) {
    return (
        <span className="kanji-answer-stack">
            <span className="kanji-answer-main">{entry.translation}</span>
            <span className="kanji-answer-reading">{renderReadings(entry)}</span>
        </span>
    );
}

function renderKanjiAnswer(entry) {
    return (
        <span className="kanji-answer-stack">
            <span className="kanji-answer-main kanji-answer-main-symbol">{entry.kanji}</span>
            <span className="kanji-answer-reading">{renderReadings(entry)}</span>
        </span>
    );
}

function KanjiTrainer() {
    const [quizMode, setQuizMode] = useState("kanji-to-translation");
    const [question, setQuestion] = useState(() => buildQuestion());
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState({ correct: 0, total: 0 });

    const currentKanji = KANJI_SET[question.correctIndex];
    const correctAnswer = question.correctIndex;
    const hasAnswered = selectedAnswer !== null;
    const isCorrect = selectedAnswer === correctAnswer;
    const scoreRatio = score.total > 0 ? score.correct / score.total : null;
    const scoreState = scoreRatio === null
        ? "is-neutral"
        : scoreRatio > 0.75
            ? "is-strong"
            : scoreRatio >= 0.4
                ? "is-neutral"
                : "is-weak";

    const switchQuizMode = (nextMode) => {
        setQuizMode(nextMode);
        setQuestion(buildQuestion(question.correctIndex));
        setSelectedAnswer(null);
    };

    const goToNextKanji = () => {
        setQuestion(buildQuestion(question.correctIndex));
        setSelectedAnswer(null);
    };

    const handleAnswer = (answerIndex) => {
        if (hasAnswered) {
            return;
        }

        const answerIsCorrect = answerIndex === correctAnswer;
        setSelectedAnswer(answerIndex);
        setScore((currentScore) => ({
            correct: currentScore.correct + (answerIsCorrect ? 1 : 0),
            total: currentScore.total + 1,
        }));
    };

    return (
        <div className="kanji-page">
            <section className="kanji-shell">
                <div className="kanji-copy">
                    <h1>Kanji Trainer</h1>
                    <p className="kanji-subtitle">
                        { quizMode === "kanji-to-translation"?
                            "A quiz where one kanji is shown and you choose the matching English meaning with its Kun and On readings in kana."
                            :
                            "A quiz where one English meaning is shown and you choose the matching kanji with its Kun and On readings in kana."
                        }                    </p>
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
                    <p className="kanji-maintenance-note">
                        {KANJI_SET_NOTE} File: <strong>src/data/kanjiTrainingData.js</strong>
                    </p>
                </div>

                <div className="kanji-card">
                    <div className={`kanji-score kanji-score-main ${scoreState}`}>
                        Score: <strong>{score.correct} / {score.total}</strong>
                    </div>
                    <div className="kanji-prompt">
                        <span className="kanji-label">
                            {quizMode === "kanji-to-translation"
                                ? "What does this kanji mean?"
                                : "Which kanji matches this translation?"}
                        </span>
                        <div className={`kanji-symbol ${quizMode === "translation-to-kanji" ? "is-translation-prompt" : ""}`}>
                            {quizMode === "kanji-to-translation"
                                ? currentKanji.kanji
                                : currentKanji.translation}
                        </div>
                    </div>

                    <div className="kanji-answers">
                        {question.answers.map((answerIndex) => {
                            const answerEntry = KANJI_SET[answerIndex];
                            const displayedAnswer = quizMode === "kanji-to-translation"
                                ? renderTranslationAnswer(answerEntry)
                                : renderKanjiAnswer(answerEntry);
                            let answerClass = "kanji-answer";

                            if (hasAnswered && answerIndex === selectedAnswer) {
                                answerClass += isCorrect ? " is-correct" : " is-wrong";
                            }

                            if (hasAnswered && !isCorrect && answerIndex === correctAnswer) {
                                answerClass += " reveal-correct";
                            }

                            return (
                                <button
                                    key={`${answerEntry.kanji}-${answerIndex}`}
                                    className={answerClass}
                                    onClick={() => handleAnswer(answerIndex)}
                                    disabled={hasAnswered}
                                    type="button"
                                >
                                    {displayedAnswer}
                                </button>
                            );
                        })}
                    </div>

                    <div className="kanji-feedback">
                        {hasAnswered ? (
                            isCorrect ? (
                                <p className="kanji-feedback-text feedback-correct">
                                    Correct. <strong>{currentKanji.kanji}</strong> reads <strong>{renderReadings(currentKanji)}</strong>.
                                </p>
                            ) : (
                                <p className="kanji-feedback-text feedback-wrong">
                                    Wrong. Correct answer:{" "}
                                    <strong>
                                        {quizMode === "kanji-to-translation"
                                            ? `${currentKanji.translation} (${renderReadings(currentKanji)})`
                                            : `${currentKanji.kanji} (${renderReadings(currentKanji)})`}
                                    </strong>
                                </p>
                            )
                        ) : (
                            <p className="kanji-feedback-text">Choose one answer.</p>
                        )}
                    </div>

                    <button className="kanji-next-button" onClick={goToNextKanji} type="button">
                        Next Kanji
                    </button>
                </div>
            </section>
        </div>
    );
}

export default KanjiTrainer;
