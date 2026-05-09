import React, { useState, useRef } from "react";
import "./KatakanaTrainer.css";
import KATAKANA_SET from '../data/katakana.json';
function getRandomIndex(excludedIndex = -1) {
    let nextIndex = Math.floor(Math.random() * KATAKANA_SET.length);
    while (KATAKANA_SET.length > 1 && nextIndex === excludedIndex) {
        nextIndex = Math.floor(Math.random() * KATAKANA_SET.length);
    }
    return nextIndex;
}

function buildQuestion(previousIndex = -1) {
    return { correctIndex: getRandomIndex(previousIndex) };
}

function KatakanaTrainer() {
    const [quizMode, setQuizMode] = useState("kana-to-romaji");
    const [question, setQuestion] = useState(() => buildQuestion());
    const [typedAnswer, setTypedAnswer] = useState("");
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const inputRef = useRef(null);

    const currentKana = KATAKANA_SET[question.correctIndex];
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
        <div className="katakana-page">
            <section className="katakana-shell">
                <div className="katakana-copy">
                    <h1>Katakana Trainer</h1>
                    <p className="katakana-subtitle">
                        {quizMode === "kana-to-romaji"
                            ? "A katakana is shown — type the corresponding romaji and press Enter."
                            : "A romaji is shown — type the corresponding katakana and press Enter."}
                    </p>
                    <div className="katakana-mode-switch">
                        <button
                            className={`katakana-mode-button ${quizMode === "kana-to-romaji" ? "is-active" : ""}`}
                            onClick={() => switchQuizMode("kana-to-romaji")}
                            type="button"
                        >
                            Katakana to Romaji
                        </button>
                        <button
                            className={`katakana-mode-button ${quizMode === "romaji-to-kana" ? "is-active" : ""}`}
                            onClick={() => switchQuizMode("romaji-to-kana")}
                            type="button"
                        >
                            Romaji to Katakana
                        </button>
                    </div>
                </div>

                <div className="katakana-card">
                    <div className={`katakana-score katakana-score-main ${scoreState}`}>
                        Score: <strong>{score.correct} / {score.total}</strong>
                    </div>
                    <div className="katakana-prompt">
                        <span className="katakana-label">
                            {quizMode === "kana-to-romaji" ? "What is this katakana?" : "Which katakana matches this romaji?"}
                        </span>
                        <div className="katakana-symbol">
                            {quizMode === "kana-to-romaji" ? currentKana.kana : currentKana.romaji.toUpperCase()}
                        </div>
                    </div>

                    <div className="katakana-text-input-row">
                        <input
                            ref={inputRef}
                            type="text"
                            className="katakana-text-input"
                            value={typedAnswer}
                            onChange={e => !hasSubmitted && setTypedAnswer(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSubmit()}
                            disabled={hasSubmitted}
                            placeholder={quizMode === "kana-to-romaji" ? "Type romaji…" : "Type katakana…"}
                            autoFocus
                        />
                        <button
                            className="katakana-submit-btn"
                            onClick={handleSubmit}
                            disabled={hasSubmitted || !typedAnswer.trim()}
                            type="button"
                        >
                            Submit
                        </button>
                    </div>

                    <div className="katakana-feedback">
                        {hasSubmitted ? (
                            isCorrect ? (
                                <p className="katakana-feedback-text feedback-correct">Correct!</p>
                            ) : (
                                <p className="katakana-feedback-text feedback-wrong">
                                    Wrong. Correct answer: <strong>{correctText}</strong>
                                </p>
                            )
                        ) : (
                            <p className="katakana-feedback-text">Type your answer and press Enter.</p>
                        )}
                    </div>

                    <button className="katakana-next-button" onClick={goToNextKana} type="button">
                        Next Katakana
                    </button>
                </div>
            </section>
        </div>
    );
}

export default KatakanaTrainer;
