import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Checkbox, Input, Select, Spin } from "antd";
import { fetchPokemon } from "../api/pokemonApi.js";
import { listCards, getCard } from "../api/pokemonCardsApi.js";
import { listTeams, getTeam, createTeam, updateTeam, deleteTeam } from "../api/teamsApi.js";
import "./PokemonTeamManager.css";

// ─── Canvas drawing constants ─────────────────────────────────────────────────

const TEAM_SIZE = 6;
const CARD_WIDTH = 854;
const CARD_HEIGHT = 480;
const EXPORT_SCALE = 2;
const DEFAULT_TEAM_NAME = "My Team";
const imageResolutionCache = new Map();

const rarityOptions = [
    { value: "normal", label: "Normal" },
    { value: "shiny", label: "Shiny" },
    { value: "platine", label: "Platine" },
];

const pokemonTypeOptions = [
    "Bug","Dark","Dragon","Electric","Fairy","Fighting","Fire","Flying","Ghost",
    "Grass","Ground","Ice","Normal","Poison","Psychic","Rock","Steel","Water","Light","Data","Sound",
].map((t) => ({ value: t, label: t }));

const typeThemes = {
    Bug: ["#6f9f2e","#9fd65a","#dff5a8"], Dark: ["#171312","#332927","#6a5a54"],
    Dragon: ["#4f2f9f","#7b57dc","#c1aeff"], Electric: ["#c69312","#f4d232","#fff1a8"],
    Fairy: ["#d58fb5","#efbdd3","#ffeaf3"], Fighting: ["#8f4e3d","#c9775f","#efb29e"],
    Fire: ["#c85e1f","#ef8c36","#ffd1a3"], Flying: ["#9b8dd6","#c3b7ef","#ece8ff"],
    Ghost: ["#473464","#6c52a0","#b9a8e0"], Grass: ["#2f8a3a","#59b85f","#bfe9a8"],
    Ground: ["#b48a52","#d7b17a","#f2dfba"], Ice: ["#7ccfe3","#a8e6f4","#e2fbff"],
    Normal: ["#7d7d7d","#b0b0b0","#e4e4e4"], Poison: ["#5c2468","#8a3e9f","#cf9de2"],
    Psychic: ["#d75c9a","#ef95bf","#ffd7e9"], Rock: ["#9a764d","#c59a6d","#ead0aa"],
    Steel: ["#7f8b94","#b4c0c8","#e5edf2"], Water: ["#2d7fcb","#63a9e9","#c0e2ff"],
    Light: ["#e4d57a","#f4e79f","#fff7d1"], Data: ["#111111","#2c2c2c","#727272"],
    Sound: ["#424242","#6a6a6a","#b5b5b5"],
};

function getTypeTheme(type) {
    return typeThemes[type] || ["#6d2a22","#b84b3b","#f0d0a0"];
}

// ─── Image helpers ────────────────────────────────────────────────────────────

function normalizeBaseName(value) {
    return value.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase()
        .replace(/&/g,"and").replace(/[''.]/g,"").replace(/[()]/g,"")
        .replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");
}

function buildCandidateImagePaths(pokemon) {
    const directCandidates = pokemon?.img_path ? [`/${pokemon.img_path.replace(/^\/+/,"")}`] : [];
    const bases = [
        pokemon?.name ? pokemon.name.replace(/ /g,"_").toLowerCase() : "",
        pokemon?.name ? normalizeBaseName(pokemon.name) : "",
    ].filter(Boolean);
    const candidates = [];
    for (const base of [...new Set(bases)]) {
        for (const ext of ["png","jpeg","jpg","webp"]) candidates.push(`/images/${base}.${ext}`);
    }
    return [...new Set([...directCandidates,...candidates])];
}

async function resolvePokemonImagePath(pokemon) {
    if (!pokemon?.name) return null;
    if (imageResolutionCache.has(pokemon.name)) return imageResolutionCache.get(pokemon.name);
    for (const candidate of buildCandidateImagePaths(pokemon)) {
        try {
            const res = await fetch(candidate, { method: "HEAD" });
            if (res.ok) { imageResolutionCache.set(pokemon.name, candidate); return candidate; }
        } catch { return null; }
    }
    imageResolutionCache.set(pokemon.name, null);
    return null;
}

function loadImage(source) {
    return new Promise((resolve, reject) => {
        if (!source) { resolve(null); return; }
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = source;
    });
}

function isSafePokemonImagePath(source) {
    return typeof source === "string" && source.startsWith("/images/");
}

function normalizePokemonTypes(types) {
    if (Array.isArray(types)) return types.filter(Boolean);
    if (typeof types === "string" && types.trim() !== "") return [types.trim()];
    return [];
}

// ─── Canvas drawing helpers ───────────────────────────────────────────────────

function drawCoverImage(ctx, img, x, y, w, h, r) {
    ctx.save(); ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); ctx.clip();
    const sr = img.width/img.height, tr = w/h;
    let dw=w,dh=h,ox=x,oy=y;
    if (sr>tr) { dw=h*sr; ox=x-(dw-w)/2; } else { dh=w/sr; oy=y-(dh-h)/2; }
    ctx.drawImage(img,ox,oy,dw,dh); ctx.restore();
}

function drawContainedImage(ctx, img, x, y, w, h, r) {
    ctx.save(); ctx.beginPath();
    ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.quadraticCurveTo(x+w,y,x+w,y+r);
    ctx.lineTo(x+w,y+h-r); ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
    ctx.lineTo(x+r,y+h); ctx.quadraticCurveTo(x,y+h,x,y+h-r);
    ctx.lineTo(x,y+r); ctx.quadraticCurveTo(x,y,x+r,y); ctx.closePath(); ctx.clip();
    const scale = Math.min(w/img.width, h/img.height);
    ctx.drawImage(img, x+(w-img.width*scale)/2, y+(h-img.height*scale)/2, img.width*scale, img.height*scale);
    ctx.restore();
}

function drawStar(ctx, cx, cy, outer, inner, color) {
    ctx.save(); ctx.beginPath();
    for (let i=0;i<10;i++) {
        const a = (Math.PI*2/10)*i - Math.PI/2, r = i%2===0?outer:inner;
        i===0 ? ctx.moveTo(cx+Math.cos(a)*r, cy+Math.sin(a)*r) : ctx.lineTo(cx+Math.cos(a)*r, cy+Math.sin(a)*r);
    }
    ctx.closePath(); ctx.fillStyle=color; ctx.fill();
    ctx.lineWidth=2; ctx.strokeStyle="rgba(79,42,36,0.9)"; ctx.stroke(); ctx.restore();
}

function drawPlatinumSparkle(ctx, cx, cy, r, color) {
    ctx.save(); ctx.beginPath();
    for (let i=0;i<8;i++) {
        const a=(Math.PI/4)*i-Math.PI/2, cr=i%2===0?r:r*0.38;
        i===0 ? ctx.moveTo(cx+Math.cos(a)*cr, cy+Math.sin(a)*cr) : ctx.lineTo(cx+Math.cos(a)*cr, cy+Math.sin(a)*cr);
    }
    ctx.closePath(); ctx.fillStyle=color; ctx.fill();
    ctx.lineWidth=2; ctx.strokeStyle="rgba(79,42,36,0.9)"; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx-r*0.18,cy-r*0.18,r*0.18,0,Math.PI*2);
    ctx.fillStyle="rgba(255,255,255,0.8)"; ctx.fill(); ctx.restore();
}

function drawWrappedText(ctx, text, x, y, maxW, lh, maxLines) {
    if (!text) return 0;
    const words = text.split(/\s+/).filter(Boolean);
    const lines = [];
    let cur = "";
    words.forEach(w => {
        const t = cur ? `${cur} ${w}` : w;
        if (ctx.measureText(t).width <= maxW) { cur=t; return; }
        if (cur) { lines.push(cur); cur=w; } else { lines.push(w); cur=""; }
    });
    if (cur) lines.push(cur);
    const visible = lines.slice(0,maxLines);
    if (lines.length>maxLines) {
        let last = visible[maxLines-1];
        while (`${last}...` !== "..." && ctx.measureText(`${last}...`).width > maxW) {
            const si = last.lastIndexOf(" ");
            last = si===-1 ? last.slice(0,-1) : last.slice(0,si);
        }
        visible[maxLines-1] = `${last||""}...`;
    }
    visible.forEach((l,i) => ctx.fillText(l, x, y+i*lh, maxW));
    return visible.length;
}

// ─── Slot helpers ─────────────────────────────────────────────────────────────

function createEmptySlot() {
    return { cardId: null, pokemonName: "", nickname: "", level: "", rarity: "normal", isMega: false };
}

function createEmptyTeam() {
    return { name: "", selectedType: "Fire", slots: Array(TEAM_SIZE).fill(null) };
}

// ─── Component ────────────────────────────────────────────────────────────────

function PokemonTeamManager() {
    // ── Pokemon data (for image resolution) ─────────────────────────────────
    const [pokemonList, setPokemonList] = useState([]);

    useEffect(() => {
        fetchPokemon().then(setPokemonList).catch(() => {});
    }, []);

    const pokemonByName = useMemo(
        () => new Map(pokemonList.map(p => [p.name, p])),
        [pokemonList],
    );

    const pokemonLabelByName = useMemo(
        () => new Map(pokemonList.map(p => [p.name, p.name.split(" ").map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(" ")])),
        [pokemonList],
    );

    // ── Server cards ─────────────────────────────────────────────────────────
    const [serverCards, setServerCards] = useState([]);

    useEffect(() => {
        listCards().then(setServerCards).catch(() => {});
    }, []);

    const cardOptions = useMemo(
        () => serverCards.map(c => ({ value: c.id, label: `${c.nickname} (${c.pokemonName})`, card: c })),
        [serverCards],
    );

    // ── Server teams ─────────────────────────────────────────────────────────
    const [serverTeams, setServerTeams] = useState([]);
    const [teamServerId, setTeamServerId] = useState(null);
    const [autoSaveStatus, setAutoSaveStatus] = useState("idle");
    const [serverDown, setServerDown] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState(undefined);
    const teamServerIdRef = useRef(null);
    const suppressNextSaveRef = useRef(false);

    useEffect(() => {
        listTeams()
            .then(teams => { setServerTeams(teams); setServerDown(false); })
            .catch(() => setServerDown(true));
    }, []);

    // ── Team state ───────────────────────────────────────────────────────────
    const [team, setTeam] = useState(createEmptyTeam);

    // ── Auto-save ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!team.name.trim()) return;
        if (suppressNextSaveRef.current) { suppressNextSaveRef.current = false; return; }

        const timer = setTimeout(async () => {
            setAutoSaveStatus("saving");
            try {
                const currentId = teamServerIdRef.current;
                if (!currentId) {
                    const created = await createTeam(team.name, team.selectedType, team.slots);
                    teamServerIdRef.current = created.id;
                    setTeamServerId(created.id);
                    setServerTeams(prev => [...prev, { id: created.id, name: created.name, createdAt: created.createdAt }]);
                } else {
                    await updateTeam(currentId, { name: team.name, selectedType: team.selectedType, slots: team.slots });
                    setServerTeams(prev => prev.map(t => t.id === currentId ? { ...t, name: team.name } : t));
                }
                setAutoSaveStatus("saved");
            } catch {
                setAutoSaveStatus("error");
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [team]);

    async function handleLoadServerTeam() {
        if (!selectedTeamId) return;
        try {
            const loaded = await getTeam(selectedTeamId);
            const enrichedSlots = await Promise.all((loaded.slots || Array(TEAM_SIZE).fill(null)).map(async slot => {
                if (!slot) return null;
                const summary = serverCards.find(c => c.id === slot.cardId);
                let level = (slot.level === "" || slot.level == null) ? (summary?.level ?? "") : slot.level;
                let rarity = slot.rarity || summary?.rarity || "normal";
                if ((level === "" || level == null) && slot.cardId) {
                    try {
                        const full = await getCard(slot.cardId);
                        level = full.state?.pokemon_level ?? "";
                        if (full.state?.pokemon_rarity) rarity = full.state.pokemon_rarity.toLowerCase();
                    } catch {}
                }
                return { ...slot, level, rarity };
            }));
            suppressNextSaveRef.current = true;
            setTeam({ name: loaded.name, selectedType: loaded.selectedType || "Fire", slots: enrichedSlots });
            setTeamServerId(loaded.id);
            teamServerIdRef.current = loaded.id;
            setAutoSaveStatus("saved");
            setSelectedTeamId(undefined);
        } catch {
            alert("Impossible de charger l'équipe depuis le serveur.");
        }
    }

    async function handleDeleteServerTeam() {
        if (!teamServerId) return;
        if (!window.confirm("Supprimer cette équipe du serveur ? Cette action est irréversible.")) return;
        try {
            await deleteTeam(teamServerId);
            setServerTeams(prev => prev.filter(t => t.id !== teamServerId));
            setTeamServerId(null);
            teamServerIdRef.current = null;
            setAutoSaveStatus("idle");
        } catch {
            alert("Impossible de supprimer l'équipe.");
        }
    }

    function handleNewTeam() {
        suppressNextSaveRef.current = false;
        setTeam(createEmptyTeam());
        setTeamServerId(null);
        teamServerIdRef.current = null;
        setAutoSaveStatus("idle");
        setSelectedTeamId(undefined);
        setUploadedImageUrl("");
        setCardPreviewUrl("");
    }

    // ── Slot editors ─────────────────────────────────────────────────────────

    async function setSlotCard(index, cardId) {
        if (!cardId) {
            setTeam(prev => {
                const slots = [...prev.slots];
                slots[index] = null;
                return { ...prev, slots };
            });
            return;
        }
        const summary = serverCards.find(c => c.id === cardId);
        let level = summary?.level ?? "";
        let rarity = summary?.rarity || "normal";
        if (level === "" || level == null) {
            try {
                const full = await getCard(cardId);
                level = full.state?.pokemon_level ?? "";
                if (full.state?.pokemon_rarity) rarity = full.state.pokemon_rarity.toLowerCase();
            } catch {}
        }
        setTeam(prev => {
            const slots = [...prev.slots];
            slots[index] = {
                cardId,
                pokemonName: summary?.pokemonName || "",
                nickname: summary?.nickname || "",
                level,
                rarity,
                isMega: false,
            };
            return { ...prev, slots };
        });
    }

    function updateSlotField(index, field, value) {
        setTeam(prev => {
            const slots = prev.slots.map((s, i) => {
                if (i !== index) return s;
                return { ...(s || createEmptySlot()), [field]: value };
            });
            return { ...prev, slots };
        });
    }

    // ── Image resolution ─────────────────────────────────────────────────────

    const [resolvedPokemon, setResolvedPokemon] = useState(Array(TEAM_SIZE).fill(null));
    const [isResolving, setIsResolving] = useState(false);

    useEffect(() => {
        let active = true;
        async function resolveAll() {
            if (!team.slots.some(s => s?.pokemonName)) { setResolvedPokemon(Array(TEAM_SIZE).fill(null)); return; }
            setIsResolving(true);
            const resolved = await Promise.all(team.slots.map(async (slot) => {
                const name = slot?.pokemonName || "";
                if (!name) return null;
                const pokemon = pokemonByName.get(name);
                const imagePath = pokemon ? await resolvePokemonImagePath(pokemon) : null;
                return {
                    name,
                    label: pokemonLabelByName.get(name) || name,
                    types: normalizePokemonTypes(pokemon?.pokemon_types),
                    imagePath,
                    level: slot?.level ?? "",
                    rarity: slot?.rarity || "normal",
                    isMega: slot?.isMega || false,
                };
            }));
            if (active) { setResolvedPokemon(resolved); setIsResolving(false); }
        }
        resolveAll();
        return () => { active = false; };
    }, [team.slots, pokemonByName, pokemonLabelByName]);

    // ── Card image generation ─────────────────────────────────────────────────

    const [uploadedImageUrl, setUploadedImageUrl] = useState("");
    const [cardPreviewUrl, setCardPreviewUrl] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationError, setGenerationError] = useState("");

    const teamLevels = useMemo(() => team.slots.map(s => s?.level ?? ""), [team.slots]);
    const teamRarities = useMemo(() => team.slots.map(s => s?.rarity || "normal"), [team.slots]);
    const teamMega = useMemo(() => team.slots.map(s => s?.isMega || false), [team.slots]);
    const pokemonNames = useMemo(() => team.slots.map(s => s?.pokemonName || ""), [team.slots]);

    useEffect(() => {
        let active = true;
        async function generate() {
            if (!pokemonNames.some(Boolean) || !uploadedImageUrl) {
                setCardPreviewUrl(""); setGenerationError(""); return;
            }
            setIsGenerating(true); setGenerationError("");
            try {
                const canvas = document.createElement("canvas");
                canvas.width = CARD_WIDTH * EXPORT_SCALE;
                canvas.height = CARD_HEIGHT * EXPORT_SCALE;
                const ctx = canvas.getContext("2d");
                if (!ctx) throw new Error("Canvas context unavailable");
                const [themeStart, themeMiddle, themeEnd] = getTypeTheme(team.selectedType);
                const finalName = team.name.trim() || DEFAULT_TEAM_NAME;
                ctx.scale(EXPORT_SCALE, EXPORT_SCALE);

                let uploadedImg = null;
                try { uploadedImg = await loadImage(uploadedImageUrl); } catch {}

                const pokemonImages = await Promise.all(resolvedPokemon.map(async slot => {
                    if (!slot?.imagePath || !isSafePokemonImagePath(slot.imagePath)) return null;
                    try { return await loadImage(slot.imagePath); } catch { return null; }
                }));

                ctx.fillStyle = "#f4ede1"; ctx.fillRect(0,0,CARD_WIDTH,CARD_HEIGHT);
                const bg = ctx.createLinearGradient(0,0,CARD_WIDTH,CARD_HEIGHT);
                bg.addColorStop(0, themeStart); bg.addColorStop(0.55, themeMiddle); bg.addColorStop(1, themeEnd);
                ctx.fillStyle = bg; ctx.fillRect(0,0,CARD_WIDTH,CARD_HEIGHT);
                ctx.fillStyle="rgba(255,248,238,0.18)"; ctx.beginPath(); ctx.arc(745,90,130,0,Math.PI*2); ctx.fill();
                ctx.fillStyle="rgba(255,248,238,0.12)"; ctx.beginPath(); ctx.arc(90,420,110,0,Math.PI*2); ctx.fill();
                ctx.fillStyle="rgba(26,17,13,0.18)"; ctx.fillRect(32,32,CARD_WIDTH-64,CARD_HEIGHT-64);
                ctx.fillStyle="rgba(255,251,246,0.92)"; ctx.fillRect(36,36,CARD_WIDTH-72,CARD_HEIGHT-72);

                const cix=36,ciy=36,ciw=CARD_WIDTH-72,cih=CARD_HEIGHT-72;
                const lcw=344,gap=24,rcx=cix+lcw+gap,rcw=ciw-lcw-gap;

                ctx.fillStyle="#6a3b34"; ctx.font="700 34px 'Trebuchet MS',sans-serif";
                ctx.textAlign="center"; ctx.textBaseline="middle";
                ctx.fillText(finalName, rcx+rcw/2, 78, rcw-16);
                ctx.textAlign="left"; ctx.textBaseline="alphabetic";

                const hw=296,hh=364,hx=cix+(lcw-hw)/2,hy=ciy+(cih-hh)/2;
                ctx.fillStyle="#efe2d0"; ctx.fillRect(hx,hy,hw,hh);
                if (uploadedImg) drawContainedImage(ctx,uploadedImg,hx,hy,hw,hh,22);
                ctx.strokeStyle="rgba(106,59,52,0.22)"; ctx.lineWidth=2; ctx.strokeRect(hx,hy,hw,hh);

                const cw=198,ch=104,gx=18,gy=12,gw=cw*2+gx,gX=rcx+(rcw-gw)/2,gY=98;
                pokemonNames.forEach((name,idx) => {
                    const col=idx%2,row=Math.floor(idx/2);
                    const x=gX+col*(cw+gx),y=gY+row*(ch+gy);
                    const slot=resolvedPokemon[idx],image=pokemonImages[idx];
                    const rar=slot?.rarity || teamRarities[idx],mega=slot?.isMega ?? teamMega[idx];
                    const lv=teamLevels[idx];
                    const lvStr = lv != null && lv !== "" ? String(lv) : "";
                    const dispName = slot?.label ? `${mega?"(Mega) ":""}${slot.label}` : "Open slot";
                    const typesLabel = slot?.types?.length ? slot.types.join(" / ") : "";

                    ctx.fillStyle="#fff9f2"; ctx.fillRect(x,y,cw,ch);
                    ctx.strokeStyle="rgba(106,59,52,0.2)"; ctx.lineWidth=2; ctx.strokeRect(x,y,cw,ch);
                    ctx.fillStyle="#8f3027"; ctx.font="700 14px 'Trebuchet MS',sans-serif";
                    ctx.textAlign="right"; ctx.fillText(`#${idx+1}`,x+cw-8,y+16); ctx.textAlign="left";

                    const ax=x+10,ay=y+10,aw=102,ah=ch-20,tx=x+120,tw=cw-132;
                    if (image && slot?.imagePath) drawCoverImage(ctx,image,ax,ay,aw,ah,16);
                    else {
                        ctx.fillStyle="#ead7c1"; ctx.fillRect(ax,ay,aw,ah);
                        ctx.fillStyle="rgba(106,59,52,0.5)"; ctx.font="600 13px 'Trebuchet MS',sans-serif";
                        ctx.fillText(name?"No image":"Empty",ax+16,y+60);
                    }

                    ctx.fillStyle="#4f2a24"; ctx.font="700 14px 'Trebuchet MS',sans-serif";
                    const nlc = drawWrappedText(ctx,dispName,tx,y+28,tw,15,2);
                    if (typesLabel) {
                        ctx.fillStyle="rgba(79,42,36,0.82)"; ctx.font="italic 600 11px 'Trebuchet MS',sans-serif";
                        drawWrappedText(ctx,typesLabel,tx,y+28+nlc*15+4,tw,13,2);
                    }
                    if (name && lvStr) { ctx.fillStyle="rgba(79,42,36,0.8)"; ctx.font="600 13px 'Trebuchet MS',sans-serif"; ctx.fillText(`Level ${lvStr}`,tx,y+88,tw); }
                    if (!name) { ctx.fillStyle="rgba(79,42,36,0.72)"; ctx.font="600 13px 'Trebuchet MS',sans-serif"; ctx.fillText("No Pokemon selected",tx,y+72,tw); }
                    if (rar==="shiny") drawStar(ctx,x+14,y+14,10,5,"#f2c94c");
                    if (rar==="platine") drawPlatinumSparkle(ctx,x+14,y+14,10,"#8fdcff");
                });

                if (active) setCardPreviewUrl(canvas.toDataURL("image/png"));
            } catch (err) {
                if (active) { setCardPreviewUrl(""); setGenerationError(`Erreur : ${err instanceof Error ? err.message : "inconnue"}`); }
            } finally {
                if (active) setIsGenerating(false);
            }
        }
        generate();
        return () => { active = false; };
    }, [resolvedPokemon, team.selectedType, pokemonNames, teamLevels, teamMega, team.name, teamRarities, uploadedImageUrl]);

    function handleImageUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setUploadedImageUrl(typeof reader.result === "string" ? reader.result : "");
        reader.onerror = () => { setUploadedImageUrl(""); setGenerationError("Impossible de lire l'image."); };
        setGenerationError("");
        reader.readAsDataURL(file);
    }

    function downloadCard() {
        if (!cardPreviewUrl) return;
        const link = document.createElement("a");
        link.href = cardPreviewUrl;
        link.download = `${normalizeBaseName(team.name || DEFAULT_TEAM_NAME) || "pokemon_team"}.png`;
        link.click();
    }

    // ── Autosave label ───────────────────────────────────────────────────────
    const autoSaveLabel = autoSaveStatus === "saving" ? "Saving…" : autoSaveStatus === "saved" ? "Saved" : autoSaveStatus === "error" ? "Save failed" : null;

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="ptm-page">
            {/* ── Header / server controls ── */}
            <section className="ptm-panel ptm-header-panel">
                <div className="ptm-header-top">
                    <div>
                        <h1>Pokemon Team Manager</h1>
                        <p className="ptm-subtitle">Compose une équipe depuis tes fiches Pokémon sauvegardées, puis génère la carte PNG.</p>
                    </div>
                </div>

                <div className="ptm-controls-row">
                    <div className="ptm-name-row">
                        <Input
                            value={team.name}
                            onChange={e => setTeam(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Nom de l'équipe"
                            size="large"
                        />
                        {team.name.trim() && autoSaveLabel ? (
                            <span className={`ptm-autosave ptm-autosave--${autoSaveStatus}`}>{autoSaveLabel}</span>
                        ) : null}
                    </div>

                    <label className="ptm-type-row">
                        <span>Type thème :</span>
                        <Select
                            value={team.selectedType}
                            options={pokemonTypeOptions}
                            onChange={v => setTeam(prev => ({ ...prev, selectedType: v }))}
                            size="large"
                            showSearch
                            optionFilterProp="label"
                        />
                    </label>

                    {!serverDown ? (
                        <div className="ptm-server-row">
                            <Select
                                placeholder="Charger une équipe…"
                                value={selectedTeamId}
                                onChange={setSelectedTeamId}
                                options={serverTeams.map(t => ({ value: t.id, label: `${t.name} (${t.slotCount || 0} Pokémon)` }))}
                                size="large"
                            />
                            <Button size="large" onClick={handleLoadServerTeam} disabled={!selectedTeamId}>Charger</Button>
                            <Button size="large" onClick={handleNewTeam}>Nouvelle équipe</Button>
                            {teamServerId ? (
                                <Button size="large" danger onClick={handleDeleteServerTeam}>Supprimer</Button>
                            ) : null}
                        </div>
                    ) : (
                        <p className="ptm-server-warning">Serveur indisponible — l'équipe ne sera pas sauvegardée automatiquement.</p>
                    )}
                </div>
            </section>

            {/* ── Main split: slots + sidebar ── */}
            <div className="ptm-body">
                {/* ── Slot editor ── */}
                <section className="ptm-panel ptm-slots-panel">
                    <h2>Composition de l'équipe</h2>
                    <p className="ptm-slots-hint">
                        {team.slots.filter(Boolean).length} / {TEAM_SIZE} Pokémon — {serverCards.length === 0 ? "Aucune fiche sauvegardée sur le serveur." : `${serverCards.length} fiche(s) disponible(s).`}
                    </p>

                    <div className="ptm-slots-grid">
                        {team.slots.map((slot, idx) => (
                            <div key={idx} className={`ptm-slot ${slot ? "ptm-slot--filled" : ""}`}>
                                <div className="ptm-slot-number">#{idx + 1}</div>

                                <label className="ptm-slot-field">
                                    <span>Fiche Pokémon</span>
                                    <Select
                                        allowClear
                                        showSearch
                                        placeholder="Choisir une fiche…"
                                        optionFilterProp="label"
                                        value={slot?.cardId || undefined}
                                        options={cardOptions}
                                        onChange={val => setSlotCard(idx, val || null)}
                                        size="large"
                                    />
                                </label>

                                {slot ? (
                                    <>
                                        <div className="ptm-slot-pokemon-name">
                                            {slot.nickname && slot.nickname !== slot.pokemonName
                                                ? `${slot.nickname} (${slot.pokemonName})`
                                                : slot.pokemonName}
                                        </div>

                                        <div className="ptm-slot-meta">
                                            {slot.level !== "" && slot.level !== undefined ? (
                                                <span className="ptm-slot-tag">Niv. {slot.level}</span>
                                            ) : null}
                                            {slot.rarity && slot.rarity !== "normal" ? (
                                                <span className="ptm-slot-tag ptm-slot-tag--rarity">
                                                    {slot.rarity.charAt(0).toUpperCase() + slot.rarity.slice(1)}
                                                </span>
                                            ) : null}
                                        </div>

                                        <Checkbox
                                            checked={slot.isMega}
                                            onChange={e => updateSlotField(idx, "isMega", e.target.checked)}
                                            className="ptm-slot-mega"
                                        >
                                            Mega
                                        </Checkbox>
                                    </>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Visual card sidebar ── */}
                <aside className="ptm-panel ptm-card-panel">
                    <h2>Carte PNG</h2>

                    <label className="ptm-upload-label">
                        <span>Image dresseur</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} />
                    </label>

                    <div className="ptm-card-status">
                        {isResolving ? <p>Résolution des images…</p> : null}
                        {generationError ? <p className="ptm-card-error">{generationError}</p> : null}
                        {!uploadedImageUrl ? <p className="ptm-card-hint">Upload une image de dresseur pour générer la carte.</p> : null}
                    </div>

                    {cardPreviewUrl ? (
                        <div className="ptm-card-preview-frame">
                            {isGenerating ? <div className="ptm-card-loading"><Spin size="large" /></div> : null}
                            <img src={cardPreviewUrl} alt="Aperçu de la carte équipe" />
                        </div>
                    ) : (
                        <div className="ptm-card-empty">
                            <p>Sélectionne au moins un Pokémon et upload une image pour voir l'aperçu.</p>
                        </div>
                    )}

                    <Button
                        type="primary"
                        size="large"
                        disabled={!cardPreviewUrl || isGenerating}
                        onClick={downloadCard}
                        block
                    >
                        Télécharger PNG
                    </Button>
                </aside>
            </div>
        </div>
    );
}

export default PokemonTeamManager;
