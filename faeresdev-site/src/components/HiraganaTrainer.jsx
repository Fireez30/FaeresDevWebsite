import React, { useState } from "react";
import "./HiraganaTrainer.css";

const HIRAGANA_SET = [
    { kana: "あ", romaji: "a" },
    { kana: "い", romaji: "i" },
    { kana: "う", romaji: "u" },
    { kana: "え", romaji: "e" },
    { kana: "お", romaji: "o" },
    { kana: "か", romaji: "ka" },
    { kana: "き", romaji: "ki" },
    { kana: "く", romaji: "ku" },
    { kana: "け", romaji: "ke" },
    { kana: "こ", romaji: "ko" },
    { kana: "が", romaji: "ga" },
    { kana: "ぎ", romaji: "gi" },
    { kana: "ぐ", romaji: "gu" },
    { kana: "げ", romaji: "ge" },
    { kana: "ご", romaji: "go" },
    { kana: "さ", romaji: "sa" },
    { kana: "し", romaji: "shi" },
    { kana: "す", romaji: "su" },
    { kana: "せ", romaji: "se" },
    { kana: "そ", romaji: "so" },
    { kana: "ざ", romaji: "za" },
    { kana: "じ", romaji: "ji" },
    { kana: "ず", romaji: "zu" },
    { kana: "ぜ", romaji: "ze" },
    { kana: "ぞ", romaji: "zo" },
    { kana: "た", romaji: "ta" },
    { kana: "ち", romaji: "chi" },
    { kana: "つ", romaji: "tsu" },
    { kana: "て", romaji: "te" },
    { kana: "と", romaji: "to" },
    { kana: "だ", romaji: "da" },
    { kana: "ぢ", romaji: "ji" },
    { kana: "づ", romaji: "zu" },
    { kana: "で", romaji: "de" },
    { kana: "ど", romaji: "do" },
    { kana: "な", romaji: "na" },
    { kana: "に", romaji: "ni" },
    { kana: "ぬ", romaji: "nu" },
    { kana: "ね", romaji: "ne" },
    { kana: "の", romaji: "no" },
    { kana: "は", romaji: "ha" },
    { kana: "ひ", romaji: "hi" },
    { kana: "ふ", romaji: "fu" },
    { kana: "へ", romaji: "he" },
    { kana: "ほ", romaji: "ho" },
    { kana: "ば", romaji: "ba" },
    { kana: "び", romaji: "bi" },
    { kana: "ぶ", romaji: "bu" },
    { kana: "べ", romaji: "be" },
    { kana: "ぼ", romaji: "bo" },
    { kana: "ぱ", romaji: "pa" },
    { kana: "ぴ", romaji: "pi" },
    { kana: "ぷ", romaji: "pu" },
    { kana: "ぺ", romaji: "pe" },
    { kana: "ぽ", romaji: "po" },
    { kana: "ま", romaji: "ma" },
    { kana: "み", romaji: "mi" },
    { kana: "む", romaji: "mu" },
    { kana: "め", romaji: "me" },
    { kana: "も", romaji: "mo" },
    { kana: "や", romaji: "ya" },
    { kana: "ゆ", romaji: "yu" },
    { kana: "よ", romaji: "yo" },
    { kana: "ら", romaji: "ra" },
    { kana: "り", romaji: "ri" },
    { kana: "る", romaji: "ru" },
    { kana: "れ", romaji: "re" },
    { kana: "ろ", romaji: "ro" },
    { kana: "わ", romaji: "wa" },
    { kana: "を", romaji: "wo" },
    { kana: "ん", romaji: "n" },
];

function getRandomIndex(excludedIndex = -1) {
    let nextIndex = Math.floor(Math.random() * HIRAGANA_SET.length);
    while (HIRAGANA_SET.length > 1 && nextIndex === excludedIndex) {
        nextIndex = Math.floor(Math.random() * HIRAGANA_SET.length);
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

    const answers = [
        correctIndex,
        distractorIndexes[0],
        distractorIndexes[1],
    ].sort(() => Math.random() - 0.5);

    return {
        correctIndex,
        answers,
    };
}

function HiraganaTrainer() {
    const [quizMode, setQuizMode] = useState("kana-to-romaji");
    const [question, setQuestion] = useState(() => buildQuestion());
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState({ correct: 0, total: 0 });

    const currentKana = HIRAGANA_SET[question.correctIndex];
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

    const goToNextKana = () => {
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
        <div className="hiragana-page">
            <section className="hiragana-shell">
                <div className="hiragana-copy">
                    <p className="hiragana-kicker">Japanese Practice</p>
                    <h1>Hiragana Trainer</h1>
                    <p className="hiragana-subtitle">
                        Switch between reading hiragana and matching romaji, then keep going with random prompts.
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
                        <div className="hiragana-symbol">{quizMode === "kana-to-romaji" ? currentKana.kana : currentKana.romaji}</div>
                    </div>

                    <div className="hiragana-answers">
                        {question.answers.map((answerIndex) => {
                            const answerEntry = HIRAGANA_SET[answerIndex];
                            const displayedAnswer = quizMode === "kana-to-romaji"
                                ? answerEntry.romaji
                                : answerEntry.kana;
                            let answerClass = "hiragana-answer";

                            if (hasAnswered && answerIndex === selectedAnswer) {
                                answerClass += isCorrect ? " is-correct" : " is-wrong";
                            }

                            if (hasAnswered && !isCorrect && answerIndex === correctAnswer) {
                                answerClass += " reveal-correct";
                            }

                            return (
                                <button
                                    key={`${answerEntry.kana}-${answerIndex}`}
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

                    <div className="hiragana-feedback">
                        {hasAnswered ? (
                            isCorrect ? (
                                <p className="hiragana-feedback-text feedback-correct">Correct.</p>
                            ) : (
                                <p className="hiragana-feedback-text feedback-wrong">
                                    Wrong. Correct answer: <strong>{quizMode === "kana-to-romaji" ? currentKana.romaji : currentKana.kana}</strong>
                                </p>
                            )
                        ) : (
                            <p className="hiragana-feedback-text">Choose one answer.</p>
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
