import React, { useState } from "react";
import "./KatakanaTrainer.css";
import { KATAKANA_COMBINATIONS } from "../data/kanaCombinations.js";

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
    { kana: "ガ", romaji: "ga" },
    { kana: "ギ", romaji: "gi" },
    { kana: "グ", romaji: "gu" },
    { kana: "ゲ", romaji: "ge" },
    { kana: "ゴ", romaji: "go" },
    { kana: "サ", romaji: "sa" },
    { kana: "シ", romaji: "shi" },
    { kana: "ス", romaji: "su" },
    { kana: "セ", romaji: "se" },
    { kana: "ソ", romaji: "so" },
    { kana: "ザ", romaji: "za" },
    { kana: "ジ", romaji: "ji" },
    { kana: "ズ", romaji: "zu" },
    { kana: "ゼ", romaji: "ze" },
    { kana: "ゾ", romaji: "zo" },
    { kana: "タ", romaji: "ta" },
    { kana: "チ", romaji: "chi" },
    { kana: "ツ", romaji: "tsu" },
    { kana: "テ", romaji: "te" },
    { kana: "ト", romaji: "to" },
    { kana: "ダ", romaji: "da" },
    { kana: "ヂ", romaji: "ji" },
    { kana: "ヅ", romaji: "zu" },
    { kana: "デ", romaji: "de" },
    { kana: "ド", romaji: "do" },
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
    { kana: "バ", romaji: "ba" },
    { kana: "ビ", romaji: "bi" },
    { kana: "ブ", romaji: "bu" },
    { kana: "ベ", romaji: "be" },
    { kana: "ボ", romaji: "bo" },
    { kana: "パ", romaji: "pa" },
    { kana: "ピ", romaji: "pi" },
    { kana: "プ", romaji: "pu" },
    { kana: "ペ", romaji: "pe" },
    { kana: "ポ", romaji: "po" },
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
    ...KATAKANA_COMBINATIONS,
    { kana: "カップ", romaji: "kappu" },
    { kana: "カット", romaji: "katto" },
    { kana: "カード", romaji: "kādo" },
    { kana: "キット", romaji: "kitto" },
    { kana: "キップ", romaji: "kippu" },
    { kana: "キー", romaji: "kī" },
    { kana: "クッキー", romaji: "kukkī" },
    { kana: "ゲーム", romaji: "gēmu" },
    { kana: "ケーキ", romaji: "kēki" },
    { kana: "コップ", romaji: "koppu" },
    { kana: "コート", romaji: "kōto" },
    { kana: "コーヒー", romaji: "kōhī" },
    { kana: "サービス", romaji: "sābisu" },
    { kana: "サッカー", romaji: "sakkā" },
    { kana: "シート", romaji: "shīto" },
    { kana: "シール", romaji: "shīru" },
    { kana: "スープ", romaji: "sūpu" },
    { kana: "スーパー", romaji: "sūpā" },
    { kana: "セーター", romaji: "sētā" },
    { kana: "ソース", romaji: "sōsu" },
    { kana: "チーズ", romaji: "chīzu" },
    { kana: "チケット", romaji: "chiketto" },
    { kana: "ドッグ", romaji: "doggu" },
    { kana: "バッグ", romaji: "baggu" },
    { kana: "バッター", romaji: "battā" },
    { kana: "ベッド", romaji: "beddo" },
    { kana: "ホットケーキ", romaji: "hottokēki" },
    { kana: "マッチ", romaji: "macchi" },
    { kana: "マップ", romaji: "mappu" },
    { kana: "メール", romaji: "mēru" },
    { kana: "ロック", romaji: "rokku" },
];

function getRandomIndex(excludedIndex = -1) {
    let nextIndex = Math.floor(Math.random() * KATAKANA_SET.length);
    while (KATAKANA_SET.length > 1 && nextIndex === excludedIndex) {
        nextIndex = Math.floor(Math.random() * KATAKANA_SET.length);
    }
    return nextIndex;
}

function formatKatakanaRomaji(romaji) {
    return romaji.toUpperCase();
}

function getDisplayedAnswer(index, quizMode) {
    return quizMode === "kana-to-romaji"
        ? formatKatakanaRomaji(KATAKANA_SET[index].romaji)
        : KATAKANA_SET[index].kana;
}

function buildQuestion(quizMode, previousIndex = -1) {
    const correctIndex = getRandomIndex(previousIndex);
    const distractorIndexes = [];
    const usedAnswers = new Set([getDisplayedAnswer(correctIndex, quizMode)]);

    while (distractorIndexes.length < 2) {
        const candidateIndex = getRandomIndex(previousIndex);
        const candidateAnswer = getDisplayedAnswer(candidateIndex, quizMode);

        if (
            candidateIndex !== correctIndex
            && !distractorIndexes.includes(candidateIndex)
            && !usedAnswers.has(candidateAnswer)
        ) {
            distractorIndexes.push(candidateIndex);
            usedAnswers.add(candidateAnswer);
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

function KatakanaTrainer() {
    const [quizMode, setQuizMode] = useState("kana-to-romaji");
    const [question, setQuestion] = useState(() => buildQuestion("kana-to-romaji"));
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState({ correct: 0, total: 0 });

    const currentKana = KATAKANA_SET[question.correctIndex];
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
        setQuestion(buildQuestion(nextMode, question.correctIndex));
        setSelectedAnswer(null);
    };

    const goToNextKana = () => {
        setQuestion(buildQuestion(quizMode, question.correctIndex));
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
        <div className="katakana-page">
            <section className="katakana-shell">
                <div className="katakana-copy">
                    <h1>Katakana Trainer</h1>
                    <p className="katakana-subtitle">
                        { quizMode === "kana-to-romaji"?
                            "A quizz with score where an katakana is shown, and user clicks on the romaji corresponding. May include combinations, breaks and elongations expressions"
                            :
                            "A quizz with score where an romaji is shown, and user clicks on the katakana corresponding. May include combinations, breaks and elongations expressions"
                        }
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
                            {quizMode === "kana-to-romaji" ? currentKana.kana : formatKatakanaRomaji(currentKana.romaji)}
                        </div>
                    </div>

                    <div className="katakana-answers">
                        {question.answers.map((answerIndex) => {
                            const answerEntry = KATAKANA_SET[answerIndex];
                            const displayedAnswer = quizMode === "kana-to-romaji"
                                ? formatKatakanaRomaji(answerEntry.romaji)
                                : answerEntry.kana;
                            let answerClass = "katakana-answer";

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

                    <div className="katakana-feedback">
                        {hasAnswered ? (
                            isCorrect ? (
                                <p className="katakana-feedback-text feedback-correct">Correct.</p>
                            ) : (
                                <p className="katakana-feedback-text feedback-wrong">
                                    Wrong. Correct answer: <strong>{quizMode === "kana-to-romaji" ? formatKatakanaRomaji(currentKana.romaji) : currentKana.kana}</strong>
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
