import React, { useState, useEffect, useCallback, useRef } from "react";
import "./HiraganaWordTrainer.css";
import { fetchRandomHiraganaWords } from "../api/japaneseApi.js";


const init_loading_count = 100;

function getRandomEntry(dataset, excludedEntry = null) {
    if (dataset.length === 1) return dataset[0];
    let entry;
    do {
        entry = dataset[Math.floor(Math.random() * dataset.length)];
    } while (entry === excludedEntry);
    return entry;
}

function checkAnswer(typed, expected) {
    const normalizedTyped = typed.trim().toLowerCase();
    const candidates = expected.split(/[/、]/).map(s => s.trim().toLowerCase());
    return candidates.some(c => c === normalizedTyped);
}

function HiraganaWordTrainer() {
    const [dataset, setDataset] = useState();
    const [dataStatus, setDataStatus] = useState("loading");

    const [quizMode, setQuizMode] = useState("hiragana-to-word");
    const [currentEntry, setCurrentEntry] = useState(() => []);
    const [userInput, setUserInput] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const inputRef = useRef(null);

    const loadWords = useCallback(() => {
        setDataStatus("loading");
        fetchRandomHiraganaWords(init_loading_count)
            .then(words => {
                setDataset(words);
                setCurrentEntry(getRandomEntry(words));
                setUserInput("");
                setSubmitted(false);
                setScore({ correct: 0, total: 0 });
                setDataStatus("ready");
            })
            .catch(() => {
            });
    }, []);

    useEffect(() => {
        loadWords();
    }, [loadWords]);

    const handleSubmit = () => {
        if (submitted || !userInput.trim()) return;
        const expected = quizMode === "hiragana-to-word" ? currentEntry.translation : currentEntry.hiragana;
        const correct = checkAnswer(userInput, expected);
        setIsCorrect(correct);
        setSubmitted(true);
        setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    };

    const goNext = useCallback(() => {
        setCurrentEntry(prev => getRandomEntry(dataset, prev));
        setUserInput("");
        setSubmitted(false);
        setTimeout(() => inputRef.current?.focus(), 0);
    }, [dataset]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            if (!submitted) handleSubmit();
            else goNext();
        }
    };

    const switchMode = (nextMode) => {
        setQuizMode(nextMode);
        setCurrentEntry(prev => getRandomEntry(dataset, prev));
        setUserInput("");
        setSubmitted(false);
    };

    const scoreRatio = score.total > 0 ? score.correct / score.total : null;
    const scoreState = scoreRatio === null
        ? "is-neutral"
        : scoreRatio > 0.75 ? "is-strong"
        : scoreRatio >= 0.4 ? "is-neutral"
        : "is-weak";

    const isHiraganaToWord = quizMode === "hiragana-to-word";
    const promptText = isHiraganaToWord ? currentEntry.hiragana : currentEntry.translation;
    const expectedAnswer = isHiraganaToWord ? currentEntry.translation : currentEntry.hiragana;

    return (
        <div className="kwt-page">
            <section className="kwt-shell">
                <div className="kwt-copy">
                    <h1>Hiragana Word Trainer</h1>
                    <p className="kwt-subtitle">
                        {isHiraganaToWord
                            ? "A hiragana word is shown — type the romaji version."
                            : "A word is shown — type it in hiragana."}
                    </p>
                    <div className="kwt-mode-switch">
                        <button
                            className={`kwt-mode-button ${quizMode === "hiragana-to-word" ? "is-active" : ""}`}
                            onClick={() => switchMode("hiragana-to-word")}
                            type="button"
                        >
                            Hiragana → Romaji
                        </button>
                        <button
                            className={`kwt-mode-button ${quizMode === "word-to-hiragana" ? "is-active" : ""}`}
                            onClick={() => switchMode("word-to-hiragana")}
                            type="button"
                        >
                            Romaji → Hiragana
                        </button>
                    </div>
                    {dataStatus === "error" && (
                        <p className="kwt-hint-note kwt-hint-error">
                            Could not reach server API. Using built-in words.{" "}
                            <button className="kwt-retry-link" onClick={loadWords} type="button">Retry</button>
                        </p>
                    )}
                    {dataStatus === "ready" && (
                        <p className="kwt-hint-note">
                            Words sourced from server<br/>
                            <button className="kwt-retry-link" onClick={loadWords} type="button">Load new batch</button>
                        </p>
                    )}
                    {!isHiraganaToWord && (
                        <p className="kwt-ime-hint">
                            Enable your Japanese IME and switch to hiragana input to type the answer.
                        </p>
                    )}
                </div>

                <div className="kwt-card">
                    {dataStatus === "loading" ? (
                        <div className="kwt-loading">Loading words…</div>
                    ) : (
                        <>
                            <div className={`kwt-score ${scoreState}`}>
                                Score: <strong>{score.correct} / {score.total}</strong>
                            </div>

                            <div className="kwt-prompt">
                                <span className="kwt-label">
                                    {isHiraganaToWord ? "What does this mean?" : "Write this in hiragana:"}
                                </span>
                                <div className={`kwt-prompt-box ${isHiraganaToWord ? "is-hiragana" : "is-word"}`}>
                                    {promptText}
                                </div>
                            </div>

                            <div className="kwt-input-area">
                                <input
                                    ref={inputRef}
                                    className={`kwt-answer-input ${submitted ? (isCorrect ? "is-correct" : "is-wrong") : ""}`}
                                    type="text"
                                    value={userInput}
                                    onChange={e => { if (!submitted) setUserInput(e.target.value); }}
                                    onKeyDown={handleKeyDown}
                                    placeholder={isHiraganaToWord ? "Type the translation…" : "Type in hiragana…"}
                                    disabled={submitted}
                                    autoFocus
                                    autoComplete="off"
                                    autoCorrect="off"
                                    spellCheck={false}
                                />
                                {!submitted && (
                                    <button
                                        className="kwt-submit-button"
                                        onClick={handleSubmit}
                                        type="button"
                                        disabled={!userInput.trim()}
                                    >
                                        Check
                                    </button>
                                )}
                            </div>

                            <div className="kwt-feedback">
                                {submitted ? (
                                    isCorrect ? (
                                        <p className="kwt-feedback-text feedback-correct">Correct!</p>
                                    ) : (
                                        <p className="kwt-feedback-text feedback-wrong">
                                            Wrong. Correct answer: <strong>{expectedAnswer}</strong>
                                        </p>
                                    )
                                ) : (
                                    <p className="kwt-feedback-text">Type your answer and press Enter or Check.</p>
                                )}
                            </div>

                            <button className="kwt-next-button" onClick={goNext} type="button">
                                {submitted ? "Next" : "Skip"}
                            </button>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}

export default HiraganaWordTrainer;
