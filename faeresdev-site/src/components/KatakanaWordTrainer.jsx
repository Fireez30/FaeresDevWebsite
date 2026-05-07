import React, { useState, useEffect, useCallback, useRef } from "react";
import "./KatakanaWordTrainer.css";

const FALLBACK_WORDS = [
    { katakana: "コーヒー", translation: "coffee" },
    { katakana: "タクシー", translation: "taxi" },
    { katakana: "テレビ", translation: "television" },
    { katakana: "コンピューター", translation: "computer" },
    { katakana: "ホテル", translation: "hotel" },
    { katakana: "カメラ", translation: "camera" },
    { katakana: "バス", translation: "bus" },
    { katakana: "アイスクリーム", translation: "ice cream" },
    { katakana: "サラダ", translation: "salad" },
    { katakana: "チョコレート", translation: "chocolate" },
];

async function fetchKatakanaWords() {
    const page = Math.floor(Math.random() * 8) + 1;
    const res = await fetch(
        `/jisho-api/api/v1/search/words?keyword=%23katakana%20%23common&page=${page}`
    );
    if (!res.ok) throw new Error("API error");
    const json = await res.json();
    const words = json.data
        .map(entry => {
            const word = entry.japanese[0]?.word || entry.japanese[0]?.reading;
            const defs = entry.senses[0]?.english_definitions;
            const translation = Array.isArray(defs) ? defs.slice(0, 3).join(" / ") : null;
            return { katakana: word, translation };
        })
        .filter(w => w.katakana && /^[゠-ヿ]+$/.test(w.katakana) && w.translation);
    return words.length >= 3 ? words : FALLBACK_WORDS;
}

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

function KatakanaWordTrainer() {
    const [dataset, setDataset] = useState(FALLBACK_WORDS);
    const [dataStatus, setDataStatus] = useState("loading");

    const [quizMode, setQuizMode] = useState("katakana-to-word");
    const [currentEntry, setCurrentEntry] = useState(() => getRandomEntry(FALLBACK_WORDS));
    const [userInput, setUserInput] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const inputRef = useRef(null);

    const loadWords = useCallback(() => {
        setDataStatus("loading");
        fetchKatakanaWords()
            .then(words => {
                setDataset(words);
                setCurrentEntry(getRandomEntry(words));
                setUserInput("");
                setSubmitted(false);
                setScore({ correct: 0, total: 0 });
                setDataStatus("ready");
            })
            .catch(() => {
                setDataset(FALLBACK_WORDS);
                setCurrentEntry(getRandomEntry(FALLBACK_WORDS));
                setUserInput("");
                setSubmitted(false);
                setScore({ correct: 0, total: 0 });
                setDataStatus("error");
            });
    }, []);

    useEffect(() => {
        loadWords();
    }, [loadWords]);

    const handleSubmit = () => {
        if (submitted || !userInput.trim()) return;
        const expected = quizMode === "katakana-to-word" ? currentEntry.translation : currentEntry.katakana;
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

    const isKatakanaToWord = quizMode === "katakana-to-word";
    const promptText = isKatakanaToWord ? currentEntry.katakana : currentEntry.translation;
    const expectedAnswer = isKatakanaToWord ? currentEntry.translation : currentEntry.katakana;

    return (
        <div className="kwt-page">
            <section className="kwt-shell">
                <div className="kwt-copy">
                    <h1>Katakana Word Trainer</h1>
                    <p className="kwt-subtitle">
                        {isKatakanaToWord
                            ? "A katakana word is shown — type the English translation."
                            : "A word is shown — type it in katakana."}
                    </p>
                    <div className="kwt-mode-switch">
                        <button
                            className={`kwt-mode-button ${quizMode === "katakana-to-word" ? "is-active" : ""}`}
                            onClick={() => switchMode("katakana-to-word")}
                            type="button"
                        >
                            Katakana → Word
                        </button>
                        <button
                            className={`kwt-mode-button ${quizMode === "word-to-katakana" ? "is-active" : ""}`}
                            onClick={() => switchMode("word-to-katakana")}
                            type="button"
                        >
                            Word → Katakana
                        </button>
                    </div>
                    {dataStatus === "error" && (
                        <p className="kwt-hint-note kwt-hint-error">
                            Could not reach Jisho API. Using built-in words.{" "}
                            <button className="kwt-retry-link" onClick={loadWords} type="button">Retry</button>
                        </p>
                    )}
                    {dataStatus === "ready" && (
                        <p className="kwt-hint-note">
                            Words sourced from{" "}
                            <a className="kwt-jisho-link" href="https://jisho.org" target="_blank" rel="noopener noreferrer">jisho.org</a>.{" "}
                            <button className="kwt-retry-link" onClick={loadWords} type="button">Load new batch</button>
                        </p>
                    )}
                    {!isKatakanaToWord && (
                        <p className="kwt-ime-hint">
                            Enable your Japanese IME and switch to katakana input to type the answer.
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
                                    {isKatakanaToWord ? "What does this mean?" : "Write this in katakana:"}
                                </span>
                                <div className={`kwt-prompt-box ${isKatakanaToWord ? "is-katakana" : "is-word"}`}>
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
                                    placeholder={isKatakanaToWord ? "Type the translation…" : "Type in katakana…"}
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

export default KatakanaWordTrainer;
