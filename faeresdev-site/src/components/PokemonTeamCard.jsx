import React, { useEffect, useState } from "react";
import { Button, Checkbox, Input, Select, Spin } from "antd";
import pokemonsData from "../data/pokemon.json";
import "./PokemonTeamCard.css";

const TEAM_SIZE = 6;
const CARD_WIDTH = 854;
const CARD_HEIGHT = 480;
const EXPORT_SCALE = 2;
const imageResolutionCache = new Map();
const DEFAULT_TEAM_NAME = "My Team";
const rarityOptions = [
    { value: "normal", label: "Normal" },
    { value: "shiny", label: "Shiny" },
    { value: "platine", label: "Platine" },
];

const pokemonOptions = [...pokemonsData]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((pokemon) => ({
        value: pokemon.name,
        label: pokemon.name
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
    }));

const pokemonByName = new Map(pokemonsData.map((pokemon) => [pokemon.name, pokemon]));
const pokemonLabelByName = new Map(pokemonOptions.map((option) => [option.value, option.label]));
const pokemonTypeOptions = [
    "Bug",
    "Dark",
    "Dragon",
    "Electric",
    "Fairy",
    "Fighting",
    "Fire",
    "Flying",
    "Ghost",
    "Grass",
    "Ground",
    "Ice",
    "Normal",
    "Poison",
    "Psychic",
    "Rock",
    "Steel",
    "Water",
    "Light",
    "Data",
    "Sound",
].map((type) => ({
    value: type,
    label: type,
}));

const typeThemes = {
    Bug: ["#6f9f2e", "#9fd65a", "#dff5a8"],
    Dark: ["#171312", "#332927", "#6a5a54"],
    Dragon: ["#4f2f9f", "#7b57dc", "#c1aeff"],
    Electric: ["#c69312", "#f4d232", "#fff1a8"],
    Fairy: ["#d58fb5", "#efbdd3", "#ffeaf3"],
    Fighting: ["#8f4e3d", "#c9775f", "#efb29e"],
    Fire: ["#c85e1f", "#ef8c36", "#ffd1a3"],
    Flying: ["#9b8dd6", "#c3b7ef", "#ece8ff"],
    Ghost: ["#473464", "#6c52a0", "#b9a8e0"],
    Grass: ["#2f8a3a", "#59b85f", "#bfe9a8"],
    Ground: ["#b48a52", "#d7b17a", "#f2dfba"],
    Ice: ["#7ccfe3", "#a8e6f4", "#e2fbff"],
    Normal: ["#7d7d7d", "#b0b0b0", "#e4e4e4"],
    Poison: ["#5c2468", "#8a3e9f", "#cf9de2"],
    Psychic: ["#d75c9a", "#ef95bf", "#ffd7e9"],
    Rock: ["#9a764d", "#c59a6d", "#ead0aa"],
    Steel: ["#7f8b94", "#b4c0c8", "#e5edf2"],
    Water: ["#2d7fcb", "#63a9e9", "#c0e2ff"],
    Light: ["#e4d57a", "#f4e79f", "#fff7d1"],
    Data: ["#111111", "#2c2c2c", "#727272"],
    Sound: ["#424242", "#6a6a6a", "#b5b5b5"],
};

function getTypeTheme(type) {
    return typeThemes[type] || ["#6d2a22", "#b84b3b", "#f0d0a0"];
}

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

function buildDownloadFileName(teamName) {
    const normalizedName = normalizeBaseName(teamName || DEFAULT_TEAM_NAME);
    return `${normalizedName || "pokemon_team_card"}.png`;
}

function buildCandidateImagePaths(pokemon) {
    const directCandidates = [];

    if (pokemon?.img_path) {
        directCandidates.push(`/${pokemon.img_path.replace(/^\/+/, "")}`);
    }

    const bases = [
        pokemon?.name ? pokemon.name.replace(/ /g, "_").toLowerCase() : "",
        pokemon?.name ? normalizeBaseName(pokemon.name) : "",
    ].filter(Boolean);

    const candidates = [];
    const extensions = ["png", "jpeg", "jpg", "webp"];

    for (const base of [...new Set(bases)]) {
        for (const extension of extensions) {
            candidates.push(`/images/${base}.${extension}`);
        }
    }

    return [...new Set([...directCandidates, ...candidates])];
}

async function resolvePokemonImagePath(pokemon) {
    if (!pokemon?.name) {
        return null;
    }

    if (imageResolutionCache.has(pokemon.name)) {
        return imageResolutionCache.get(pokemon.name);
    }

    for (const candidate of buildCandidateImagePaths(pokemon)) {
        try {
            const response = await fetch(candidate, { method: "HEAD" });
            if (response.ok) {
                imageResolutionCache.set(pokemon.name, candidate);
                return candidate;
            }
        } catch {
            return null;
        }
    }

    imageResolutionCache.set(pokemon.name, null);
    return null;
}

function loadImage(source) {
    return new Promise((resolve, reject) => {
        if (!source) {
            resolve(null);
            return;
        }

        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = source;
    });
}

function isSafePokemonImagePath(source) {
    return typeof source === "string" && source.startsWith("/images/");
}

function normalizePokemonTypes(types) {
    if (Array.isArray(types)) {
        return types.filter(Boolean);
    }

    if (typeof types === "string" && types.trim() !== "") {
        return [types.trim()];
    }

    return [];
}

function drawCoverImage(context, image, x, y, width, height, radius) {
    context.save();
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
    context.clip();

    const sourceRatio = image.width / image.height;
    const targetRatio = width / height;
    let drawWidth = width;
    let drawHeight = height;
    let offsetX = x;
    let offsetY = y;

    if (sourceRatio > targetRatio) {
        drawWidth = height * sourceRatio;
        offsetX = x - (drawWidth - width) / 2;
    } else {
        drawHeight = width / sourceRatio;
        offsetY = y - (drawHeight - height) / 2;
    }

    context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    context.restore();
}

function drawContainedImage(context, image, x, y, width, height, radius) {
    context.save();
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
    context.clip();

    const scale = Math.min(width / image.width, height / image.height);
    const drawWidth = image.width * scale;
    const drawHeight = image.height * scale;
    const offsetX = x + (width - drawWidth) / 2;
    const offsetY = y + (height - drawHeight) / 2;

    context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    context.restore();
}

function drawStar(context, centerX, centerY, outerRadius, innerRadius, color) {
    context.save();
    context.beginPath();

    for (let pointIndex = 0; pointIndex < 10; pointIndex += 1) {
        const angle = ((Math.PI * 2) / 10) * pointIndex - Math.PI / 2;
        const radius = pointIndex % 2 === 0 ? outerRadius : innerRadius;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        if (pointIndex === 0) {
            context.moveTo(x, y);
        } else {
            context.lineTo(x, y);
        }
    }

    context.closePath();
    context.fillStyle = color;
    context.fill();
    context.restore();
}

function drawDiamond(context, centerX, centerY, radius, color) {
    context.save();
    context.beginPath();
    context.moveTo(centerX, centerY - radius);
    context.lineTo(centerX + radius, centerY);
    context.lineTo(centerX, centerY + radius);
    context.lineTo(centerX - radius, centerY);
    context.closePath();
    context.fillStyle = color;
    context.fill();
    context.restore();
}

function PokemonTeamCard() {
    const [team, setTeam] = useState(Array(TEAM_SIZE).fill(""));
    const [teamLevels, setTeamLevels] = useState(Array(TEAM_SIZE).fill(""));
    const [teamRarities, setTeamRarities] = useState(Array(TEAM_SIZE).fill("normal"));
    const [teamMega, setTeamMega] = useState(Array(TEAM_SIZE).fill(false));
    const [teamName, setTeamName] = useState("");
    const [selectedType, setSelectedType] = useState("Fire");
    const [uploadedImageUrl, setUploadedImageUrl] = useState("");
    const [resolvedPokemon, setResolvedPokemon] = useState(Array(TEAM_SIZE).fill(null));
    const [cardPreviewUrl, setCardPreviewUrl] = useState("");
    const [isResolving, setIsResolving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState("");

    useEffect(() => {
        let isActive = true;

        async function resolveTeamImages() {
            const selectedPokemon = team.map((name) => pokemonByName.get(name) || null);

            if (!selectedPokemon.some(Boolean)) {
                setResolvedPokemon(Array(TEAM_SIZE).fill(null));
                setIsResolving(false);
                return;
            }

            setIsResolving(true);

            const resolved = await Promise.all(
                selectedPokemon.map(async (pokemon) => {
                    if (!pokemon) {
                        return null;
                    }

                    const imagePath = await resolvePokemonImagePath(pokemon);
                    return {
                        name: pokemon.name,
                        label: pokemonLabelByName.get(pokemon.name) || pokemon.name,
                        types: normalizePokemonTypes(pokemon.pokemon_types),
                        imagePath,
                    };
                }),
            );

            if (isActive) {
                setResolvedPokemon(resolved);
                setIsResolving(false);
            }
        }

        resolveTeamImages();

        return () => {
            isActive = false;
        };
    }, [team]);

    useEffect(() => {
        let isActive = true;

        async function generateCard() {
            const hasPokemon = team.some(Boolean);

            if (!hasPokemon || !uploadedImageUrl) {
                setCardPreviewUrl("");
                setGenerationError("");
                return;
            }

            setIsGenerating(true);
            setGenerationError("");

            try {
                const canvas = document.createElement("canvas");
                canvas.width = CARD_WIDTH * EXPORT_SCALE;
                canvas.height = CARD_HEIGHT * EXPORT_SCALE;
                const context = canvas.getContext("2d");
                if (!context) {
                    throw new Error("Canvas context unavailable");
                }
                const [themeStart, themeMiddle, themeEnd] = getTypeTheme(selectedType);
                const finalTeamName = teamName.trim() || DEFAULT_TEAM_NAME;
                context.scale(EXPORT_SCALE, EXPORT_SCALE);

                let uploadedImage = null;

                try {
                    uploadedImage = await loadImage(uploadedImageUrl);
                } catch {
                    uploadedImage = null;
                }

                const pokemonImages = await Promise.all(
                    resolvedPokemon.map(async (slot) => {
                        if (!slot?.imagePath || !isSafePokemonImagePath(slot.imagePath)) {
                            return null;
                        }

                        try {
                            return await loadImage(slot.imagePath);
                        } catch {
                            return null;
                        }
                    }),
                );

                context.fillStyle = "#f4ede1";
                context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

                const backgroundGradient = context.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
                backgroundGradient.addColorStop(0, themeStart);
                backgroundGradient.addColorStop(0.55, themeMiddle);
                backgroundGradient.addColorStop(1, themeEnd);
                context.fillStyle = backgroundGradient;
                context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

                context.fillStyle = "rgba(255, 248, 238, 0.18)";
                context.beginPath();
                context.arc(745, 90, 130, 0, Math.PI * 2);
                context.fill();

                context.fillStyle = "rgba(255, 248, 238, 0.12)";
                context.beginPath();
                context.arc(90, 420, 110, 0, Math.PI * 2);
                context.fill();

                context.fillStyle = "rgba(26, 17, 13, 0.18)";
                context.fillRect(32, 32, CARD_WIDTH - 64, CARD_HEIGHT - 64);

                context.fillStyle = "rgba(255, 251, 246, 0.92)";
                context.fillRect(36, 36, CARD_WIDTH - 72, CARD_HEIGHT - 72);

                const cardInsetX = 36;
                const cardInsetY = 36;
                const cardInnerWidth = CARD_WIDTH - 72;
                const cardInnerHeight = CARD_HEIGHT - 72;
                const leftColumnWidth = 368;
                const columnGap = 24;
                const rightColumnX = cardInsetX + leftColumnWidth + columnGap;
                const rightColumnWidth = cardInnerWidth - leftColumnWidth - columnGap;

                context.fillStyle = "#6a3b34";
                context.font = "700 34px 'Trebuchet MS', sans-serif";
                context.textAlign = "center";
                context.textBaseline = "middle";
                context.fillText(finalTeamName, rightColumnX + rightColumnWidth / 2, 78, rightColumnWidth - 16);
                context.textAlign = "left";
                context.textBaseline = "alphabetic";

                const heroWidth = 328;
                const heroHeight = 364;
                const heroX = cardInsetX + (leftColumnWidth - heroWidth) / 2;
                const heroY = cardInsetY + (cardInnerHeight - heroHeight) / 2;

                context.fillStyle = "#efe2d0";
                context.fillRect(heroX, heroY, heroWidth, heroHeight);

                if (uploadedImage) {
                    drawContainedImage(context, uploadedImage, heroX, heroY, heroWidth, heroHeight, 22);
                }

                context.strokeStyle = "rgba(106, 59, 52, 0.22)";
                context.lineWidth = 2;
                context.strokeRect(heroX, heroY, heroWidth, heroHeight);

                const cellWidth = 182;
                const cellHeight = 100;
                const gapX = 18;
                const gapY = 16;
                const gridWidth = cellWidth * 2 + gapX;
                const gridX = rightColumnX + (rightColumnWidth - gridWidth) / 2;
                const gridY = 102;

                team.forEach((name, index) => {
                    const column = index % 2;
                    const row = Math.floor(index / 2);
                    const x = gridX + column * (cellWidth + gapX);
                    const y = gridY + row * (cellHeight + gapY);
                    const slot = resolvedPokemon[index];
                    const image = pokemonImages[index];
                    const level = teamLevels[index];
                    const rarity = teamRarities[index];
                    const isMega = teamMega[index];
                    const displayName = slot?.label ? `${isMega ? "(Mega) " : ""}${slot.label}` : "Open slot";
                    const typesLabel = slot?.types?.length ? slot.types.join(" / ") : "";

                    context.fillStyle = "#fff9f2";
                    context.fillRect(x, y, cellWidth, cellHeight);

                    context.strokeStyle = "rgba(106, 59, 52, 0.2)";
                    context.lineWidth = 2;
                    context.strokeRect(x, y, cellWidth, cellHeight);

                    context.fillStyle = "#8f3027";
                    context.font = "700 14px 'Trebuchet MS', sans-serif";
                    context.textAlign = "right";
                    context.fillText(`#${index + 1}`, x + cellWidth - 12, y + 22);
                    context.textAlign = "left";

                    if (image && slot?.imagePath) {
                        drawCoverImage(context, image, x + 10, y + 10, 94, cellHeight - 20, 16);
                    } else {
                        context.fillStyle = "#ead7c1";
                        context.fillRect(x + 10, y + 10, 94, cellHeight - 20);
                        context.fillStyle = "rgba(106, 59, 52, 0.5)";
                        context.font = "600 13px 'Trebuchet MS', sans-serif";
                        context.fillText(name ? "No image" : "Empty", x + 28, y + 60);
                    }

                    context.fillStyle = "#4f2a24";
                    context.font = "700 15px 'Trebuchet MS', sans-serif";
                    context.fillText(displayName, x + 116, y + 34, cellWidth - 128);

                    if (typesLabel) {
                        context.fillStyle = "rgba(79, 42, 36, 0.82)";
                        context.font = "600 12px 'Trebuchet MS', sans-serif";
                        context.fillText(typesLabel, x + 116, y + 54, cellWidth - 128);
                    }

                    if (name && level !== "") {
                        context.fillStyle = "rgba(79, 42, 36, 0.8)";
                        context.font = "600 13px 'Trebuchet MS', sans-serif";
                        context.fillText(`Level ${level}`, x + 116, y + 76, cellWidth - 128);
                    }

                    if (!name) {
                        context.fillStyle = "rgba(79, 42, 36, 0.72)";
                        context.font = "600 13px 'Trebuchet MS', sans-serif";
                        context.fillText("No Pokemon selected", x + 116, y + 72, cellWidth - 128);
                    }

                    if (rarity === "shiny") {
                        drawStar(context, x + 24, y + 24, 10, 5, "#f2c94c");
                    }

                    if (rarity === "platine") {
                        drawDiamond(context, x + 24, y + 24, 10, "#8aa4d6");
                    }
                });

                if (isActive) {
                    setCardPreviewUrl(canvas.toDataURL("image/png"));
                }
            } catch (error) {
                if (isActive) {
                    setCardPreviewUrl("");
                    setGenerationError(
                        `Impossible de generer la carte : ${error instanceof Error ? error.message : "erreur inconnue"}`,
                    );
                }
            } finally {
                if (isActive) {
                    setIsGenerating(false);
                }
            }
        }

        generateCard();

        return () => {
            isActive = false;
        };
    }, [resolvedPokemon, selectedType, team, teamLevels, teamMega, teamName, teamRarities, uploadedImageUrl]);

    function handlePokemonChange(index, value) {
        setTeam((currentTeam) => currentTeam.map((pokemon, currentIndex) => (
            currentIndex === index ? (value || "") : pokemon
        )));
    }

    function handleLevelChange(index, value) {
        const digitsOnly = value.replace(/[^0-9]/g, "");
        const normalizedValue = digitsOnly === "" ? "" : String(Math.min(150, Math.max(0, Number(digitsOnly))));

        setTeamLevels((currentLevels) => currentLevels.map((level, currentIndex) => (
            currentIndex === index ? normalizedValue : level
        )));
    }

    function handleRarityChange(index, value) {
        setTeamRarities((currentRarities) => currentRarities.map((rarity, currentIndex) => (
            currentIndex === index ? value : rarity
        )));
    }

    function handleMegaChange(index, checked) {
        setTeamMega((currentMega) => currentMega.map((isMega, currentIndex) => (
            currentIndex === index ? checked : isMega
        )));
    }

    function handleImageUpload(event) {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setUploadedImageUrl(typeof reader.result === "string" ? reader.result : "");
        };

        reader.onerror = () => {
            setUploadedImageUrl("");
            setGenerationError("Impossible de lire l'image envoyee.");
        };

        setGenerationError("");
        reader.readAsDataURL(file);
    }

    function downloadCard() {
        if (!cardPreviewUrl) {
            return;
        }

        const link = document.createElement("a");
        link.href = cardPreviewUrl;
        link.download = buildDownloadFileName(teamName.trim() || DEFAULT_TEAM_NAME);
        link.click();
    }

    return (
        <div className="pokemon-team-card-page">
            <section className="pokemon-team-card-panel">
                <div className="pokemon-team-card-header">
                    <div>
                        <p className="pokemon-team-card-kicker">Pokemon Role Playing Games</p>
                        <h1>Pokemon Team Card</h1>
                        <p>
                            Choose up to six Pokemon in order, upload one image, and export a 16:9 team card.
                        </p>
                    </div>
                </div>

                <div className="pokemon-team-card-controls">
                    <div className="pokemon-team-card-selects">
                        <label className="pokemon-team-card-field pokemon-team-card-field-wide">
                            <span>Team name</span>
                            <Input
                                placeholder="Enter a team name"
                                value={teamName}
                                onChange={(event) => setTeamName(event.target.value)}
                            />
                        </label>

                        <label className="pokemon-team-card-field pokemon-team-card-field-wide">
                            <span>Theme type</span>
                            <Select
                                showSearch
                                optionFilterProp="label"
                                value={selectedType}
                                options={pokemonTypeOptions}
                                onChange={setSelectedType}
                            />
                        </label>

                        {team.map((pokemon, index) => (
                            <div className="pokemon-team-card-slot" key={`slot-${index + 1}`}>
                                <label className="pokemon-team-card-field">
                                    <span>Slot {index + 1}</span>
                                    <Select
                                        allowClear
                                        showSearch
                                        placeholder="Select a Pokemon"
                                        optionFilterProp="label"
                                        value={pokemon || undefined}
                                        options={pokemonOptions}
                                        onChange={(value) => handlePokemonChange(index, value)}
                                    />
                                </label>

                                <label className="pokemon-team-card-field">
                                    <span>Level</span>
                                    <Input
                                        inputMode="numeric"
                                        maxLength={3}
                                        placeholder="0-150"
                                        value={teamLevels[index]}
                                        onChange={(event) => handleLevelChange(index, event.target.value)}
                                    />
                                </label>

                                <label className="pokemon-team-card-field">
                                    <span>Rarete</span>
                                    <Select
                                        value={teamRarities[index]}
                                        options={rarityOptions}
                                        onChange={(value) => handleRarityChange(index, value)}
                                    />
                                </label>

                                <label className="pokemon-team-card-checkbox">
                                    <Checkbox
                                        checked={teamMega[index]}
                                        disabled={!pokemon}
                                        onChange={(event) => handleMegaChange(index, event.target.checked)}
                                    >
                                        Mega Pokemon
                                    </Checkbox>
                                </label>
                            </div>
                        ))}
                    </div>

                    <div className="pokemon-team-card-sidebar">
                        <label className="pokemon-team-card-upload">
                    <span>Trainer image</span>
                            <input accept="image/*" type="file" onChange={handleImageUpload} />
                        </label>

                        <div className="pokemon-team-card-status">
                            <p>{team.filter(Boolean).length} Pokemon selected</p>
                            <p>{uploadedImageUrl ? "Image ready" : "Upload an image to generate the card"}</p>
                            {isResolving ? <p>Resolving Pokemon images...</p> : null}
                            {generationError ? <p>{generationError}</p> : null}
                        </div>

                        <Button
                            className="pokemon-team-card-download"
                            disabled={!cardPreviewUrl || isGenerating}
                            type="primary"
                            onClick={downloadCard}
                        >
                            Download PNG
                        </Button>
                    </div>
                </div>
            </section>

            <section className="pokemon-team-card-preview-panel">
                <div className="pokemon-team-card-preview-header">
                    <h2>Preview</h2>
                    <span>1708 x 960 export</span>
                </div>

                {!cardPreviewUrl ? (
                    <div className="pokemon-team-card-empty-state">
                        <p>Select at least one Pokemon and upload an image to generate the card.</p>
                    </div>
                ) : (
                    <div className="pokemon-team-card-preview-frame">
                        {isGenerating ? (
                            <div className="pokemon-team-card-loading">
                                <Spin size="large" />
                            </div>
                        ) : null}
                        <img alt="Pokemon team card preview" src={cardPreviewUrl} />
                    </div>
                )}
            </section>
        </div>
    );
}

export default PokemonTeamCard;
