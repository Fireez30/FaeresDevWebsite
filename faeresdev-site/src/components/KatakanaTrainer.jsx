import React, { useState } from "react";
import "./KatakanaTrainer.css";

const KATAKANA_SET = [
    { kana: "ア", romaji: "a" },
    { kana: "イ", romaji: "i" },
    { kana: "ウ", romaji: "u" },
    { kana: "エ", romaji: "e" },
    { kana: "オ", romaji: "o" },
    { kana: "カ", romaji: "ka" },
    { kana: "キ", romaji: "ki" },
    { kana: "ク", romaji: "ku" },
    { kana: "ケ", romaji: "ke" },
    { kana: "コ", romaji: "ko" },
    { kana: "サ", romaji: "sa" },
    { kana: "シ", romaji: "shi" },
    { kana: "ス", romaji: "su" },
    { kana: "セ", romaji: "se" },
    { kana: "ソ", romaji: "so" },
    { kana: "タ", romaji: "ta" },
    { kana: "チ", romaji: "chi" },
    { kana: "ツ", romaji: "tsu" },
    { kana: "テ", romaji: "te" },
    { kana: "ト", romaji: "to" },
    { kana: "ナ", romaji: "na" },
    { kana: "ニ", romaji: "ni" },
    { kana: "ヌ", romaji: "nu" },
    { kana: "ネ", romaji: "ne" },
    { kana: "ノ", romaji: "no" },
    { kana: "ハ", romaji: "ha" },
    { kana: "ヒ", romaji: "hi" },
    { kana: "フ", romaji: "fu" },
    { kana: "ヘ", romaji: "he" },
    { kana: "ホ", romaji: "ho" },
    { kana: "マ", romaji: "ma" },
    { kana: "ミ", romaji: "mi" },
    { kana: "ム", romaji: "mu" },
    { kana: "メ", romaji: "me" },
    { kana: "モ", romaji: "mo" },
    { kana: "ヤ", romaji: "ya" },
    { kana: "ユ", romaji: "yu" },
    { kana: "ヨ", romaji: "yo" },
    { kana: "ラ", romaji: "ra" },
    { kana: "リ", romaji: "ri" },
    { kana: "ル", romaji: "ru" },
    { kana: "レ", romaji: "re" },
    { kana: "ロ", romaji: "ro" },
    { kana: "ワ", romaji: "wa" },
    { kana: "ヲ", romaji: "wo" },
    { kana: "ン", romaji: "n" },
];

function getRandomIndex(excludedIndex = -1) {
    let nextIndex = Math.floor(Math.random() * KATAKANA_SET.length);
    while (KATAKANA_SET.length > 1 && nextIndex === excludedIndex) {
        nextIndex = Math.floor(Math.random() * KATAKANA_SET.length);
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
        KATAKANA_SET[correctIndex].romaji,
        KATAKANA_SET[distractorIndexes[0]].romaji,
        KATAKANA_SET[distractorIndexes[1]].romaji,
    ].sort(() => Math.random() - 0.5);

    return {
        correctIndex,
        answers,
    };
}

function KatakanaTrainer() {
    const [quizMode, setQuizMode] = useState("kana-to-romaji");
    const [question, setQuestion] = useState(() => buildQuestion());
    const [selectedAnswer, setSelectedAnswer] = useState("");
    const [score, setScore] = useState({ correct: 0, total: 0 });

    const currentKana = KATAKANA_SET[question.correctIndex];
    const correctAnswer = currentKana.romaji;
    const hasAnswered = selectedAnswer !== "";
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
        setSelectedAnswer("");
    };

    const goToNextKana = () => {
        setQuestion(buildQuestion(question.correctIndex));
        setSelectedAnswer("");
    };

    const handleAnswer = (answer) => {
        if (hasAnswered) {
            return;
        }

        const answerIsCorrect = answer === correctAnswer;
        setSelectedAnswer(answer);
        setScore((currentScore) => ({
            correct: currentScore.correct + (answerIsCorrect ? 1 : 0),
            total: currentScore.total + 1,
        }));
    };

    return (
        <div className="katakana-page">
            <section className="katakana-shell">
                <div className="katakana-copy">
                    <p className="katakana-kicker">Japanese Practice</p>
                    <h1>Katakana Trainer</h1>
                    <p className="katakana-subtitle">
                        Switch between reading katakana and matching romaji, then keep going with random prompts.
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
                        <div className="katakana-symbol">{quizMode === "kana-to-romaji" ? currentKana.kana : currentKana.romaji}</div>
                    </div>

                    <div className="katakana-answers">
                        {question.answers.map((answer) => {
                            const displayedAnswer = quizMode === "kana-to-romaji"
                                ? answer
                                : KATAKANA_SET.find((entry) => entry.romaji === answer)?.kana ?? answer;
                            let answerClass = "katakana-answer";

                            if (hasAnswered && answer === selectedAnswer) {
                                answerClass += isCorrect ? " is-correct" : " is-wrong";
                            }

                            if (hasAnswered && !isCorrect && answer === correctAnswer) {
                                answerClass += " reveal-correct";
                            }

                            return (
                                <button
                                    key={answer}
                                    className={answerClass}
                                    onClick={() => handleAnswer(answer)}
                                    disabled={hasAnswered}
                                    type="button"
                                >
                                    {displayedAnswer}
                                </button>
                            );
                        })}
                    </div>

                    <div className="katakana-feedback">
                        {hasAnswered ? (
                            isCorrect ? (
                                <p className="katakana-feedback-text feedback-correct">Correct.</p>
                            ) : (
                                <p className="katakana-feedback-text feedback-wrong">
                                    Wrong. Correct answer: <strong>{quizMode === "kana-to-romaji" ? currentKana.romaji : currentKana.kana}</strong>
                                </p>
                            )
                        ) : (
                            <p className="katakana-feedback-text">Choose one answer.</p>
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
