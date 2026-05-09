import React, { useState, useRef } from "react";
import "./HiraganaTrainer.css";
import HIRAGANA_SET from '../data/hiragana.json';
function getRandomIndex(excludedIndex = -1) {
    let nextIndex = Math.floor(Math.random() * HIRAGANA_SET.length);
    while (HIRAGANA_SET.length > 1 && nextIndex === excludedIndex) {
        nextIndex = Math.floor(Math.random() * HIRAGANA_SET.length);
    }
    return nextIndex;
}

function buildQuestion(previousIndex = -1) {
    return { correctIndex: getRandomIndex(previousIndex) };
}

function HiraganaTrainer() {
    const [quizMode, setQuizMode] = useState("kana-to-romaji");
    const [question, setQuestion] = useState(() => buildQuestion());
    const [typedAnswer, setTypedAnswer] = useState("");
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const inputRef = useRef(null);

    const currentKana = HIRAGANA_SET[question.correctIndex];
    const correctText = quizMode === "kana-to-romaji" ? currentKana.romaji : currentKana.kana;
    const isCorrect = hasSubmitted && typedAnswer.trim().toLowerCase() === correctText.toLowerCase();

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
        setTypedAnswer("");
        setHasSubmitted(false);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const goToNextKana = () => {
        setQuestion(buildQuestion(question.correctIndex));
        setTypedAnswer("");
        setHasSubmitted(false);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleSubmit = () => {
        if (hasSubmitted || !typedAnswer.trim()) return;
        const correct = typedAnswer.trim().toLowerCase() === correctText.toLowerCase();
        setHasSubmitted(true);
        setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    };

    return (
        <div className="hiragana-page">
            <section className="hiragana-shell">
                <div className="hiragana-copy">
                    <h1>Hiragana Trainer</h1>
                    <p className="hiragana-subtitle">
                        {quizMode === "kana-to-romaji"
                            ? "A hiragana is shown — type the corresponding romaji and press Enter."
                            : "A romaji is shown — type the corresponding hiragana and press Enter."}
                    </p>
                    <div className="hiragana-mode-switch">
                        <button
                            className={`hiragana-mode-button ${quizMode === "kana-to-romaji" ? "is-active" : ""}`}
                            onClick={() => switchQuizMode("kana-to-romaji")}
                            type="button"
                        >
                            Hiragana to Romaji
                        </button>
                        <button
                            className={`hiragana-mode-button ${quizMode === "romaji-to-kana" ? "is-active" : ""}`}
                            onClick={() => switchQuizMode("romaji-to-kana")}
                            type="button"
                        >
                            Romaji to Hiragana
                        </button>
                    </div>
                </div>

                <div className="hiragana-card">
                    <div className={`hiragana-score hiragana-score-main ${scoreState}`}>
                        Score: <strong>{score.correct} / {score.total}</strong>
                    </div>
                    <div className="hiragana-prompt">
                        <span className="hiragana-label">
                            {quizMode === "kana-to-romaji" ? "What is this hiragana?" : "Which hiragana matches this romaji?"}
                        </span>
                        <div className="hiragana-symbol">
                            {quizMode === "kana-to-romaji" ? currentKana.kana : currentKana.romaji}
                        </div>
                    </div>

                    <div className="hiragana-text-input-row">
                        <input
                            ref={inputRef}
                            type="text"
                            className="hiragana-text-input"
                            value={typedAnswer}
                            onChange={e => !hasSubmitted && setTypedAnswer(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSubmit()}
                            disabled={hasSubmitted}
                            placeholder={quizMode === "kana-to-romaji" ? "Type romaji…" : "Type hiragana…"}
                            autoFocus
                        />
                        <button
                            className="hiragana-submit-btn"
                            onClick={handleSubmit}
                            disabled={hasSubmitted || !typedAnswer.trim()}
                            type="button"
                        >
                            Submit
                        </button>
                    </div>

                    <div className="hiragana-feedback">
                        {hasSubmitted ? (
                            isCorrect ? (
                                <p className="hiragana-feedback-text feedback-correct">Correct!</p>
                            ) : (
                                <p className="hiragana-feedback-text feedback-wrong">
                                    Wrong. Correct answer: <strong>{correctText}</strong>
                                </p>
                            )
                        ) : (
                            <p className="hiragana-feedback-text">Type your answer and press Enter.</p>
                        )}
                    </div>

                    <button className="hiragana-next-button" onClick={goToNextKana} type="button">
                        Next Hiragana
                    </button>
                </div>
            </section>
        </div>
    );
}

export default HiraganaTrainer;
