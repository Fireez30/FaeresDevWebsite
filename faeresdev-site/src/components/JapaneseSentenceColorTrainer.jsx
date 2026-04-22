import React, { useEffect, useState } from "react";
import "./JapaneseSentenceColorTrainer.css";
import {
    FALLBACK_JAPANESE_SENTENCES,
    SCRIPT_TYPE_LABELS,
    SCRIPT_TYPE_ORDER,
    TATOEBA_API_URL,
} from "../data/japaneseScriptColorGameData.js";
import { HIRAGANA_COMBINATIONS, KATAKANA_COMBINATIONS } from "../data/kanaCombinations.js";

const TYPE_STYLES = {
    hiragana: { swatch: "#2f6df6", className: "is-hiragana" },
    katakana: { swatch: "#2ca86a", className: "is-katakana" },
    combination: { swatch: "#ec4899", className: "is-combination" },
    kanji: { swatch: "#dc4c3f", className: "is-kanji" },
    romaji: { swatch: "#8a5cf6", className: "is-romaji" },
    break: { swatch: "#f59e0b", className: "is-break" },
    long: { swatch: "#14b8a6", className: "is-long" },
};

const PAUSE_CHARACTERS = new Set(["っ", "ッ", "、", ",", "・", "!", "！", "?", "？", "…", "(", ")", "「", "」", "『", "』"]);
const TERMINAL_PUNCTUATION = new Set(["。", ".", "．", "｡", "!", "！", "?", "？", "…"]);
const ROMAJI_REGEX = /[A-Za-z0-9]/;
const HIRAGANA_REGEX = /[\u3040-\u309F]/;
const KATAKANA_REGEX = /[\u30A0-\u30FF\uFF66-\uFF9D]/;
const KANJI_REGEX = /[\u3400-\u4DBF\u4E00-\u9FFF]/;
const PLAYABLE_TYPES = new Set(["hiragana", "katakana", "combination", "kanji", "romaji", "break", "long"]);
const COMBINATION_TOKENS = new Set([
    ...HIRAGANA_COMBINATIONS.map((entry) => entry.kana),
    ...KATAKANA_COMBINATIONS.map((entry) => entry.kana),
]);

function isTerminalPunctuation(character, index, text) {
    return index === text.length - 1 && TERMINAL_PUNCTUATION.has(character);
}

function classifyToken(tokenText) {
    if (COMBINATION_TOKENS.has(tokenText)) {
        return "combination";
    }

    return classifyCharacter(tokenText);
}

function classifyCharacter(character) {
    if (character === "ー") {
        return "long";
    }

    if (PAUSE_CHARACTERS.has(character)) {
        return "break";
    }

    if (ROMAJI_REGEX.test(character)) {
        return "romaji";
    }

    if (HIRAGANA_REGEX.test(character)) {
        return "hiragana";
    }

    if (KATAKANA_REGEX.test(character)) {
        return "katakana";
    }

    if (KANJI_REGEX.test(character)) {
        return "kanji";
    }

    if (character === "。") {
        return "break";
    }

    return "unknown";
}

function tokenizeSentence(text) {
    const normalizedText = text.normalize("NFC");
    const characters = Array.from(normalizedText);
    const tokens = [];

    for (let index = 0; index < characters.length; index += 1) {
        const character = characters[index];
        const nextCharacter = characters[index + 1];
        const combinedToken = nextCharacter ? `${character}${nextCharacter}` : character;
        const tokenText = COMBINATION_TOKENS.has(combinedToken) ? combinedToken : character;
        const type = classifyToken(tokenText);
        const locked = tokenText.length === 1 && isTerminalPunctuation(character, index, normalizedText);

        if (!PLAYABLE_TYPES.has(type) && !locked) {
            continue;
        }

        tokens.push({ text: tokenText, type, locked });

        if (tokenText.length > 1) {
            index += 1;
        }
    }

    return tokens;
}

function buildSentenceModel(entry) {
    const normalizedText = entry.text.normalize("NFC");
    const tokens = tokenizeSentence(normalizedText);
    return {
        id: entry.id,
        text: normalizedText,
        translation: entry.translation,
        source: entry.source || "local",
        tokens,
    };
}

function getRandomFallbackSentence(previousId = null) {
    const candidates = FALLBACK_JAPANESE_SENTENCES.filter((sentence) => sentence.id !== previousId);
    const pool = candidates.length > 0 ? candidates : FALLBACK_JAPANESE_SENTENCES;
    return buildSentenceModel(pool[Math.floor(Math.random() * pool.length)]);
}

function createInitialAssignments(tokens) {
    return tokens.map(() => null);
}

function extractTranslationText(translations) {
    if (!translations) {
        return "";
    }

    const stack = Array.isArray(translations) ? [...translations] : [translations];
    const collected = [];

    while (stack.length > 0) {
        const current = stack.pop();

        if (!current || typeof current !== "object") {
            continue;
        }

        if (typeof current.text === "string" && current.text.trim() !== "") {
            collected.push({
                text: current.text.trim(),
                lang: current.lang || current.lang_code || current.language || "",
            });
        }

        Object.values(current).forEach((value) => {
            if (Array.isArray(value)) {
                stack.push(...value);
            } else if (value && typeof value === "object") {
                stack.push(value);
            }
        });
    }

    const preferredTranslation = collected.find((entry) => entry.lang === "fra")
        || collected.find((entry) => entry.lang === "eng")
        || collected[0];

    return preferredTranslation ? preferredTranslation.text : "";
}

function normalizeRemoteSentence(item) {
    const text = typeof item.text === "string" ? item.text.trim().normalize("NFC") : "";
    const translation = extractTranslationText(item.translations).normalize("NFC");

    if (text === "" || translation === "") {
        return null;
    }

    return buildSentenceModel({
        id: `tatoeba-${item.id || text}`,
        text,
        translation,
        source: "tatoeba",
    });
}

async function fetchOnlineSentence(previousId) {
    const params = new URLSearchParams({
        lang: "jpn",
        limit: "20",
        sort: "random",
        "trans:lang": "fra,eng",
        "trans:is_direct": "yes",
        showtrans: "matching",
        is_unapproved: "no",
        is_orphan: "no",
    });

    const response = await fetch(`${TATOEBA_API_URL}?${params.toString()}`);

    if (!response.ok) {
        throw new Error(`Remote fetch failed with status ${response.status}`);
    }

    const payload = await response.json();
    const rows = Array.isArray(payload?.data) ? payload.data : [];
    const candidates = rows
        .map(normalizeRemoteSentence)
        .filter((entry) => entry && entry.id !== previousId && entry.tokens.some((token) => !token.locked));

    if (candidates.length === 0) {
        throw new Error("No suitable remote sentence found");
    }

    return candidates[Math.floor(Math.random() * candidates.length)];
}

function JapaneseSentenceColorTrainer() {
    const [sentence, setSentence] = useState(() => getRandomFallbackSentence());
    const [selectedType, setSelectedType] = useState("hiragana");
    const [assignments, setAssignments] = useState(() => createInitialAssignments(sentence.tokens));
    const [hasValidated, setHasValidated] = useState(false);
    const [isLoadingSentence, setIsLoadingSentence] = useState(false);
    const [remoteStatus, setRemoteStatus] = useState("offline");

    const currentAssignments = assignments.length === sentence.tokens.length
        ? assignments
        : createInitialAssignments(sentence.tokens);
    const playableIndexes = sentence.tokens.reduce((indexes, token, index) => {
        if (!token.locked) {
            indexes.push(index);
        }
        return indexes;
    }, []);
    const totalPlayable = playableIndexes.length;
    const completedCount = playableIndexes.filter((index) => Boolean(currentAssignments[index])).length;
    const isFullyAssigned = completedCount === totalPlayable;
    const correctCount = playableIndexes.reduce((count, index) => (
        currentAssignments[index] === sentence.tokens[index].type ? count + 1 : count
    ), 0);

    useEffect(() => {
        let isMounted = true;

        const loadInitialRemoteSentence = async () => {
            setIsLoadingSentence(true);

            try {
                const remoteSentence = await fetchOnlineSentence(null);
                if (!isMounted) {
                    return;
                }

                setSentence(remoteSentence);
                setAssignments(createInitialAssignments(remoteSentence.tokens));
                setHasValidated(false);
                setRemoteStatus("online");
            } catch {
                if (isMounted) {
                    setRemoteStatus("fallback");
                }
            } finally {
                if (isMounted) {
                    setIsLoadingSentence(false);
                }
            }
        };

        loadInitialRemoteSentence();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleSelectType = (type) => {
        setSelectedType(type);
    };

    const handleAssignType = (index) => {
        setAssignments((current) => {
            const nextAssignments = current.length === sentence.tokens.length
                ? [...current]
                : createInitialAssignments(sentence.tokens);
            nextAssignments[index] = selectedType;
            return nextAssignments;
        });
        setHasValidated(false);
    };

    const handleReset = () => {
        setAssignments(createInitialAssignments(sentence.tokens));
        setHasValidated(false);
    };

    const handleNextSentence = async () => {
        setIsLoadingSentence(true);

        try {
            const nextSentence = await fetchOnlineSentence(sentence.id);
            setSentence(nextSentence);
            setAssignments(createInitialAssignments(nextSentence.tokens));
            setHasValidated(false);
            setRemoteStatus("online");
        } catch {
            const nextFallbackSentence = getRandomFallbackSentence(sentence.id);
            setSentence(nextFallbackSentence);
            setAssignments(createInitialAssignments(nextFallbackSentence.tokens));
            setHasValidated(false);
            setRemoteStatus("fallback");
        } finally {
            setIsLoadingSentence(false);
        }
    };

    const handleValidate = () => {
        setHasValidated(true);
    };

    return (
        <div className="script-color-page">
            <section className="script-color-shell">
                <div className="script-color-copy">
                    <h1>Japanese sentences tokens training</h1>
                    <p className="script-color-subtitle">
                        Load japanese sentences from Tatoeba open API, for user to mark each character with its type. If Tatoeba fails, fallbacks to preloaded sentences.
                        Sentences may contain : Kanji, Kanas, Kana combinations, Break, Elongation and Romaji.
                    </p>
                    <div className="script-color-legend">
                        {SCRIPT_TYPE_ORDER.map((type) => (
                            <div className="script-color-legend-item" key={type}>
                                <span
                                    className="script-color-legend-swatch"
                                    style={{ backgroundColor: TYPE_STYLES[type].swatch }}
                                />
                                <span>{SCRIPT_TYPE_LABELS[type]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="script-color-card">
                    <div className="script-color-card-top">
                        <div className={`script-color-score ${hasValidated ? "is-visible" : ""}`}>
                            {hasValidated ? `${correctCount} / ${totalPlayable}` : `${completedCount} / ${totalPlayable} places`}
                        </div>
                        <div className={`script-color-source script-color-source-${remoteStatus}`}>
                            {isLoadingSentence
                                ? "Chargement..."
                                : remoteStatus === "online"
                                    ? "Source: Tatoeba"
                                    : "Source: local"}
                        </div>
                    </div>

                    <div className="script-color-phrase">{sentence.text}</div>

                    <div className="script-color-palette">
                        {SCRIPT_TYPE_ORDER.map((type) => {
                            const isActive = selectedType === type;
                            return (
                                <button
                                    key={type}
                                    className={`script-color-palette-button ${isActive ? "is-active" : ""}`}
                                    onClick={() => handleSelectType(type)}
                                    type="button"
                                >
                                    <span
                                        className="script-color-palette-swatch"
                                        style={{ backgroundColor: TYPE_STYLES[type].swatch }}
                                    />
                                    {SCRIPT_TYPE_LABELS[type]}
                                </button>
                            );
                        })}
                    </div>

                    <div className="script-color-sentence">
                        {sentence.tokens.map((token, index) => {
                            const assignedType = currentAssignments[index];
                            const isCorrect = assignedType === token.type;
                            const showCorrection = hasValidated && !token.locked && assignedType !== token.type;

                            if (token.locked) {
                                return (
                                    <span
                                        key={`${sentence.id}-${index}-${token.text}`}
                                        className="script-token script-token-static"
                                    >
                                        <span className="script-token-text">{token.text}</span>
                                    </span>
                                );
                            }

                            return (
                                <button
                                    key={`${sentence.id}-${index}-${token.text}`}
                                    className={[
                                        "script-token",
                                        hasValidated ? (isCorrect ? "is-correct" : "is-wrong") : "",
                                        !hasValidated && assignedType ? TYPE_STYLES[assignedType].className : "",
                                    ].join(" ").trim()}
                                    disabled={isLoadingSentence}
                                    onClick={() => handleAssignType(index)}
                                    type="button"
                                >
                                    <span className="script-token-text">{token.text}</span>
                                    <span className="script-token-type">
                                        {assignedType ? SCRIPT_TYPE_LABELS[assignedType] : "?"}
                                    </span>
                                    {showCorrection && (
                                        <span className="script-token-correction">
                                            {SCRIPT_TYPE_LABELS[token.type]}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="script-color-actions">
                        <button className="script-color-secondary" disabled={isLoadingSentence} onClick={handleReset} type="button">
                            Reset
                        </button>
                        <button
                            className="script-color-primary"
                            disabled={!isFullyAssigned || isLoadingSentence}
                            onClick={handleValidate}
                            type="button"
                        >
                            Validate
                        </button>
                        <button className="script-color-secondary" disabled={isLoadingSentence} onClick={handleNextSentence} type="button">
                            New sentence
                        </button>
                    </div>

                    <div className="script-color-feedback">
                        {hasValidated ? (
                            correctCount === totalPlayable ? (
                                <p className="script-color-feedback-text is-success">
                                    Everything is correct!
                                </p>
                            ) : (
                                <p className="script-color-feedback-text is-error">
                                    Some elements are incorrect. Check the correction.
                                </p>
                            )
                        ) : (
                            <p className="script-color-feedback-text">
                                Choose a category, and click on elements to assign them. When everything is done, click validate.
                            </p>
                        )}
                        {hasValidated && (
                            <p className="script-color-translation">
                                Traduction: <strong>{sentence.translation}</strong>
                            </p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}

export default JapaneseSentenceColorTrainer;
