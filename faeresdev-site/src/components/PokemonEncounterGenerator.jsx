import React, { useMemo, useRef, useState } from "react";
import { Alert, Button, Input, InputNumber, Select } from "antd";
import pokemonsData from "../data/pokemon.json";
import "./PokemonEncounterGenerator.css";

const SECTION_CONFIG = [
    { key: "common", label: "Common" },
    { key: "uncommon", label: "Uncommon" },
    { key: "rare", label: "Rare" },
    { key: "superRare", label: "Super Rare" },
];

const IMAGE_EXTENSIONS = ["png", "jpeg", "jpg", "webp"];

const uniquePokemons = Array.from(
    new Map(pokemonsData.map((pokemon) => [pokemon.name, pokemon])).values(),
).sort((a, b) => a.name.localeCompare(b.name));

const pokemonByName = new Map(uniquePokemons.map((pokemon) => [pokemon.name, pokemon]));

const pokemonOptions = uniquePokemons.map((pokemon) => ({
    value: pokemon.name,
    label: pokemon.name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
}));

function normalizeBaseName(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/['’.]/g, "")
        .replace(/[()]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}

function getPokemonLabel(name) {
    return name
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function buildCandidateImagePaths(name) {
    const bases = [
        name.replace(/ /g, "_").toLowerCase(),
        normalizeBaseName(name),
    ].filter(Boolean);

    return [...new Set(
        bases.flatMap((base) => IMAGE_EXTENSIONS.map((extension) => `/images/${base}.${extension}`)),
    )];
}

function PokemonImage({ name, label }) {
    const [candidateIndex, setCandidateIndex] = useState(0);
    const sources = useMemo(() => buildCandidateImagePaths(name), [name]);
    const src = sources[candidateIndex] || "";

    if (!src) {
        return <div className="encounter-pokemon-card__image encounter-pokemon-card__image--missing">?</div>;
    }

    return (
        <img
            className="encounter-pokemon-card__image"
            src={src}
            alt={label}
            onError={() => {
                if (candidateIndex < sources.length - 1) {
                    setCandidateIndex(candidateIndex + 1);
                }
            }}
        />
    );
}

function createEmptyZone() {
    return {
        zoneName: "",
        sections: {
            common: [],
            uncommon: [],
            rare: [],
            superRare: [],
        },
    };
}

function sanitizeZoneData(value) {
    const next = createEmptyZone();
    const zoneName = typeof value?.zoneName === "string" ? value.zoneName : "";
    next.zoneName = zoneName;

    SECTION_CONFIG.forEach(({ key }) => {
        const sectionValues = Array.isArray(value?.sections?.[key]) ? value.sections[key] : [];
        next.sections[key] = sectionValues
            .filter((name) => typeof name === "string" && pokemonByName.has(name))
            .filter((name, index, array) => array.indexOf(name) === index);
    });

    return next;
}

function downloadJson(data, filename) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
}

function rollDice(count, sides) {
    let total = 0;

    for (let index = 0; index < count; index += 1) {
        total += Math.floor(Math.random() * sides) + 1;
    }

    return total;
}

function rollRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resolveEncounterRule(value) {
    if (value >= 20) {
        const outbreakRoll = rollRange(1, 100);

        if (outbreakRoll <= 50) {
            const firstRoll = rollDice(1, 12);
            const secondRoll = rollDice(2, 8);
            const total = firstRoll + secondRoll;

            return {
                label: `Outbreak: ${total} Pokemon`,
                detail: `d100 (${outbreakRoll}) -> 1d12 (${firstRoll}) + 2d8 (${secondRoll}) = ${total}`,
            };
        }

        if (outbreakRoll <= 70) {
            const rangeRoll = rollRange(15, 25);
            const bonusRoll = rollDice(2, 10);
            const total = rangeRoll + bonusRoll;

            return {
                label: `Outbreak: ${total} Pokemon`,
                detail: `d100 (${outbreakRoll}) -> 15-25 (${rangeRoll}) + 2d10 (${bonusRoll}) = ${total}`,
            };
        }

        if (outbreakRoll <= 90) {
            const rangeRoll = rollRange(25, 40);
            const bonusRoll = rollDice(2, 12);
            const total = rangeRoll + bonusRoll;

            return {
                label: `Outbreak: ${total} Pokemon`,
                detail: `d100 (${outbreakRoll}) -> 25-40 (${rangeRoll}) + 2d12 (${bonusRoll}) = ${total}`,
            };
        }

        if (outbreakRoll <= 95) {
            const rangeRoll = rollRange(40, 60);
            const bonusRoll = rollDice(2, 20);
            const total = rangeRoll + bonusRoll;

            return {
                label: `Outbreak: ${total} Pokemon`,
                detail: `d100 (${outbreakRoll}) -> 40-60 (${rangeRoll}) + 2d20 (${bonusRoll}) = ${total}`,
            };
        }

        const rangeRoll = rollRange(70, 75);
        const bonusRoll = rollDice(2, 20);
        const total = rangeRoll + bonusRoll;

        return {
            label: `Outbreak: ${total} Pokemon`,
            detail: `d100 (${outbreakRoll}) -> 70-75 (${rangeRoll}) + 2d20 (${bonusRoll}) = ${total}`,
        };
    }

    if (value >= 18) {
        const bonus = rollDice(2, 8);
        return {
            label: `${10 + bonus} encounters`,
            detail: `10 encounters + 2d8 (${bonus})`,
        };
    }

    if (value >= 16) {
        const bonus = rollDice(2, 6);
        return {
            label: `${8 + bonus} encounters`,
            detail: `8 encounters + 2d6 (${bonus})`,
        };
    }

    if (value >= 11) {
        const bonus = rollDice(1, 6);
        return {
            label: `${6 + bonus} encounters`,
            detail: `6 encounters + 1d6 (${bonus})`,
        };
    }

    if (value >= 6) {
        const bonus = rollDice(1, 4);
        return {
            label: `${4 + bonus} encounters`,
            detail: `4 encounters + 1d4 (${bonus})`,
        };
    }

    if (value >= 1) {
        return {
            label: "2 encounters",
            detail: "2 encounters + 0",
        };
    }

    return {
        label: "0 encounter",
        detail: "No encounter",
    };
}

function PokemonEncounterGenerator() {
    const [zone, setZone] = useState(createEmptyZone);
    const [selectedBySection, setSelectedBySection] = useState({
        common: undefined,
        uncommon: undefined,
        rare: undefined,
        superRare: undefined,
    });
    const [rolledPokemonBySection, setRolledPokemonBySection] = useState({
        common: undefined,
        uncommon: undefined,
        rare: undefined,
        superRare: undefined,
    });
    const [feedback, setFeedback] = useState({ type: "", message: "" });
    const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
    const [encounterRuleValue, setEncounterRuleValue] = useState(0);
    const [encounterResult, setEncounterResult] = useState(resolveEncounterRule(0));
    const fileInputRef = useRef(null);

    function updateZoneName(event) {
        const value = event.target.value;
        setZone((current) => ({
            ...current,
            zoneName: value,
        }));
    }

    function updateSelectedPokemon(sectionKey, value) {
        setSelectedBySection((current) => ({
            ...current,
            [sectionKey]: value,
        }));
    }

    function addPokemon(sectionKey) {
        const pokemonName = selectedBySection[sectionKey];
        if (!pokemonName) {
            setFeedback({ type: "warning", message: "Select a Pokemon before adding it to the zone." });
            return;
        }

        setZone((current) => {
            if (current.sections[sectionKey].includes(pokemonName)) {
                return current;
            }

            return {
                ...current,
                sections: {
                    ...current.sections,
                    [sectionKey]: [...current.sections[sectionKey], pokemonName],
                },
            };
        });

        setSelectedBySection((current) => ({
            ...current,
            [sectionKey]: undefined,
        }));
        setFeedback({ type: "success", message: `${getPokemonLabel(pokemonName)} added to ${SECTION_CONFIG.find((section) => section.key === sectionKey)?.label}.` });
    }

    function removePokemon(sectionKey, pokemonName) {
        setZone((current) => ({
            ...current,
            sections: {
                ...current.sections,
                [sectionKey]: current.sections[sectionKey].filter((name) => name !== pokemonName),
            },
        }));
        setRolledPokemonBySection((current) => ({
            ...current,
            [sectionKey]: current[sectionKey] === pokemonName ? undefined : current[sectionKey],
        }));
    }

    function triggerLoad() {
        fileInputRef.current?.click();
    }

    function handleFileLoad(event) {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const parsed = JSON.parse(reader.result);
                const sanitized = sanitizeZoneData(parsed);
                setZone(sanitized);
                setSelectedBySection({
                    common: undefined,
                    uncommon: undefined,
                    rare: undefined,
                    superRare: undefined,
                });
                setRolledPokemonBySection({
                    common: undefined,
                    uncommon: undefined,
                    rare: undefined,
                    superRare: undefined,
                });
                setFeedback({ type: "success", message: `Zone loaded from ${file.name}.` });
            } catch {
                setFeedback({ type: "error", message: "The selected file is not a valid Pokemon zone JSON." });
            }
        };
        reader.readAsText(file);
    }

    function saveZone() {
        const hasEntries = SECTION_CONFIG.some(({ key }) => zone.sections[key].length > 0);
        if (!hasEntries) {
            setFeedback({ type: "warning", message: "Add at least one Pokemon before saving the zone." });
            return;
        }

        const filenameBase = normalizeBaseName(zone.zoneName) || "pokemon_encounter_zone";
        downloadJson(zone, `${filenameBase}.json`);
        setFeedback({ type: "success", message: "Zone JSON saved to your device." });
    }

    function toggleEditorVisibility() {
        setIsEditorCollapsed((current) => !current);
    }

    function handleEncounterRuleChange(value) {
        const safeValue = Math.max(0, Math.min(20, Number.isFinite(value) ? value : 0));
        setEncounterRuleValue(safeValue);
    }

    function rollEncounterRule() {
        setEncounterResult(resolveEncounterRule(encounterRuleValue));
    }

    function rollSectionPokemon(sectionKey) {
        const sectionPokemons = zone.sections[sectionKey];

        if (sectionPokemons.length < 2) {
            return;
        }

        const rolledPokemon = sectionPokemons[Math.floor(Math.random() * sectionPokemons.length)];
        setRolledPokemonBySection((current) => ({
            ...current,
            [sectionKey]: rolledPokemon,
        }));
        setFeedback({
            type: "success",
            message: `${getPokemonLabel(rolledPokemon)} rolled from ${SECTION_CONFIG.find((section) => section.key === sectionKey)?.label}.`,
        });
    }

    return (
        <div className="encounter-generator-page">
            <section className="encounter-generator-hero">
                <div>
                    <p className="encounter-generator-kicker">Pokemon Tool</p>
                    <h1>Pokemon Encounter Generator</h1>
                    <p className="encounter-generator-subtitle">
                        Build an encounter zone, sort Pokemon by rarity, reload a previous JSON file, and export the finished zone.
                    </p>
                </div>
                <div className="encounter-generator-actions">
                    <div className="encounter-generator-actions__top">
                        <button
                            className={`encounter-generator-collapse ${isEditorCollapsed ? "is-collapsed" : ""}`}
                            type="button"
                            onClick={toggleEditorVisibility}
                            aria-label={isEditorCollapsed ? "Expand zone editor" : "Collapse zone editor"}
                            title={isEditorCollapsed ? "Expand zone editor" : "Collapse zone editor"}
                        >
                            <span className="encounter-generator-collapse__arrow" aria-hidden="true">
                                ^
                            </span>
                        </button>
                    </div>
                    <Input
                        value={zone.zoneName}
                        onChange={updateZoneName}
                        placeholder="Zone name"
                        size="large"
                    />
                    <div className="encounter-generator-toolbar">
                        <Button size="large" onClick={triggerLoad}>
                            Load Zone
                        </Button>
                        <Button size="large" type="primary" onClick={saveZone}>
                            Save Zone
                        </Button>
                    </div>
                    <input
                        ref={fileInputRef}
                        className="encounter-generator-file-input"
                        type="file"
                        accept="application/json,.json"
                        onChange={handleFileLoad}
                    />
                    {feedback.message ? (
                        <Alert
                            type={feedback.type || "info"}
                            message={feedback.message}
                            showIcon
                        />
                    ) : null}
                </div>
            </section>

            {!isEditorCollapsed ? (
                <section className="encounter-generator-sections">
                    {SECTION_CONFIG.map((section) => (
                        <article className="encounter-section" key={section.key}>
                            <div className="encounter-section__header">
                                <div>
                                    <h2>{section.label}</h2>
                                </div>
                                <div className="encounter-section__header-actions">
                                    {zone.sections[section.key].length >= 2 ? (
                                        <Button size="middle" type="primary" onClick={() => rollSectionPokemon(section.key)}>
                                            Roll Pokemon
                                        </Button>
                                    ) : null}
                                    <span className="encounter-section__count">
                                        {zone.sections[section.key].length} Pokemon
                                    </span>
                                </div>
                            </div>

                            <div className="encounter-section__controls">
                                <Select
                                    showSearch
                                    size="large"
                                    value={selectedBySection[section.key]}
                                    placeholder="Select a Pokemon"
                                    options={pokemonOptions}
                                    optionFilterProp="label"
                                    onChange={(value) => updateSelectedPokemon(section.key, value)}
                                />
                                <Button size="large" type="primary" onClick={() => addPokemon(section.key)}>
                                    Add
                                </Button>
                            </div>

                            {rolledPokemonBySection[section.key] ? (
                                <div className="encounter-section__rolled">
                                    Rolled: <strong>{getPokemonLabel(rolledPokemonBySection[section.key])}</strong>
                                </div>
                            ) : null}

                            {zone.sections[section.key].length > 0 ? (
                                <div className="encounter-section__grid">
                                    {zone.sections[section.key].map((pokemonName) => {
                                        const label = getPokemonLabel(pokemonName);

                                        return (
                                            <div
                                                className={`encounter-pokemon-card ${rolledPokemonBySection[section.key] === pokemonName ? "encounter-pokemon-card--rolled" : ""}`}
                                                key={`${section.key}-${pokemonName}`}
                                            >
                                                <PokemonImage name={pokemonName} label={label} />
                                                <span className="encounter-pokemon-card__name">{label}</span>
                                                <button
                                                    className="encounter-pokemon-card__remove"
                                                    type="button"
                                                    onClick={() => removePokemon(section.key, pokemonName)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="encounter-section__empty">
                                    No Pokemon in this section yet.
                                </div>
                            )}
                        </article>
                    ))}
                </section>
            ) : null}

            <section className="encounter-rules-panel">
                <div className="encounter-rules-panel__header">
                    <div>
                        <p className="encounter-generator-kicker">Pokemon Tool</p>
                        <h2>Encounter rules</h2>
                    </div>
                </div>
                <div className="encounter-rules-panel__content">
                    <InputNumber
                        min={0}
                        max={20}
                        size="large"
                        value={encounterRuleValue}
                        onChange={handleEncounterRuleChange}
                    />
                    <Button size="large" type="primary" onClick={rollEncounterRule}>
                        Roll
                    </Button>
                    <div className="encounter-rules-panel__result">
                        <span className="encounter-rules-panel__result-label">{encounterResult.label}</span>
                        <span className="encounter-rules-panel__result-detail">{encounterResult.detail}</span>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default PokemonEncounterGenerator;
