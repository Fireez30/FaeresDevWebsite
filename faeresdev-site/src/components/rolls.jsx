import React, {useState} from "react";
import "./Rolls.css";
import Button from 'react-bootstrap/Button';
import {Checkbox, Input, InputNumber} from "antd";
function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function writeCookie(name,value){
    const date = new Date();
    date.setTime(date.getTime() + (1000*7 * 24 * 60 * 60 * 1000));
    document.cookie = name+"="+value+"; expires=" + date.toUTCString() + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}
function eraseCookie(name) {
    document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function rollDiceExpression(expr) {
    const diceRegex = /(\d+)d(\d+)/gi;

    const rolls = [];
    let replacedExpr = expr;

    replacedExpr = replacedExpr.replace(diceRegex, (match, numDice, numSides) => {
        numDice = parseInt(numDice, 10);
        numSides = parseInt(numSides, 10);

        const results = [];
        for (let i = 0; i < numDice; i++) {
            const roll = Math.floor(Math.random() * numSides) + 1;
            results.push(roll);
        }

        rolls.push({
            dice: `${numDice}d${numSides}`,
            results: results,
            total: results.reduce((a, b) => a + b, 0)
        });

        return results.reduce((a, b) => a + b, 0);
    });

    const final = Function(`"use strict"; return (${replacedExpr})`)();

    return {
        expression: expr,
        rolls: rolls,
        final: final
    };
}

function Rolls() {
    const [dexnav, setDexnav] = useState(0);
    const [card_dexnav, setCardDexnav] = useState(0);
    const [alt_rolls,setAltRolls] = useState("");
    const [pokemonShinyRoll, setPokemonShinyRoll] = useState(1);
    const [number_of_shiny_to_roll, setNumberOfShinyToRoll] = useState(1);
    const [number_of_cards_to_roll, setNumberOfCardsToRoll] = useState(1);
    const [cardRoll1, setcardRoll1] = useState(1);
    const [cardRoll2, setcardRoll2] = useState(33);
    const [cardRoll3, setcardRoll3] = useState(66);
    const [cardShinyRoll1, setcardShinyRoll1] = useState(22);
    const [cardShinyRoll2, setcardShinyRoll2] = useState(44);
    const [cardPlatineRoll1, setcardPlatineRoll1] = useState(100);
    const [rolled_encounter_bracket,setRolledEncounterBracket] = useState(-1);
    const [roll_capture_accuracy,setRollCaptureAccuracy] = useState(-1);
    const [roll_capture_rate,setRollCaptureRate] = useState(-1);
    const [rolled_encounter_count,setRolledEncounterCount] = useState(-1);
    const [rolled_dice,setRolledDice] = useState("");
    const [list_rolls_shiny_poke,setListRollsShinyPoke] = useState([]);
    const [list_rolls_normal_cards,setListRollsNormalCards] = useState([]);
    const [is_pokemon_shiny,setIsPokemonShiny] = useState(false);
    const [is_pokemon_platine,setIsPokemonPlatine] = useState(false);

    if (getCookie("cardRoll1")){
        let cookie_value = parseInt(getCookie("cardRoll1"));
        if (cookie_value !== cardRoll1){
            setcardRoll1(parseInt(getCookie("cardRoll1")));
        }

    }

    if (getCookie("cardRoll2")){
        let cookie_value = parseInt(getCookie("cardRoll2"));
        if (cookie_value !== cardRoll2){
            setcardRoll2(parseInt(getCookie("cardRoll2")));
        }

    }

    if (getCookie("cardRoll3")){
        let cookie_value = parseInt(getCookie("cardRoll3"));
        if (cookie_value !== cardRoll3){
            setcardRoll3(parseInt(getCookie("cardRoll3")));
        }

    }

    if (getCookie("cardShinyRoll1")){
        let cookie_value = parseInt(getCookie("cardShinyRoll1"));
        if (cookie_value !== cardShinyRoll1){
            setcardShinyRoll1(parseInt(getCookie("cardShinyRoll1")));
        }

    }

    if (getCookie("cardShinyRoll2")){
        let cookie_value = parseInt(getCookie("cardShinyRoll2"));
        if (cookie_value !== cardShinyRoll2){
            setcardShinyRoll2(parseInt(getCookie("cardShinyRoll2")));
        }

    }

    if (getCookie("cardPlatineRoll1")){
        let cookie_value = parseInt(getCookie("cardPlatineRoll1"));
        if (cookie_value !== cardPlatineRoll1){
            setcardPlatineRoll1(parseInt(getCookie("cardPlatineRoll1")));
        }

    }


    if (getCookie("dexnav")){
        let cookie_value = parseInt(getCookie("dexnav"));
        if (cookie_value !== dexnav){
            setDexnav(parseInt(getCookie("dexnav")));
        }

    }

    if (getCookie("card_dexnav")){
        let cookie_value = parseInt(getCookie("card_dexnav"));
        if (cookie_value !== card_dexnav){
            setCardDexnav(parseInt(getCookie("card_dexnav")));
        }

    }

    if (getCookie("pokemonShinyRoll")){
        let cookie_value = parseInt(getCookie("pokemonShinyRoll"));
        if (cookie_value !== pokemonShinyRoll){
            setPokemonShinyRoll(parseInt(getCookie("pokemonShinyRoll")));
        }

    }

    const diceLines = rolled_dice.split("\n").filter((line) => line.trim() !== "");

    return (
        <div className="rolls-page">
            <div className="rolls-hero">
                <p className="rolls-kicker">Utility Board</p>
                <h1>Dice Rolls</h1>
                <p className="rolls-subtitle">Faster encounter, capture, shiny, and card checks in one view.</p>
            </div>

            <div className="rolls-grid">
                <section className="roll-card roll-card-wide">
                    <div className="roll-card-header">
                        <h3>Expression Roller</h3>
                        <span>Supports formulas like `2d6+1d8+3`.</span>
                    </div>
                    <div className="roll-inline-form">
                        <Input
                            value={alt_rolls}
                            onChange={e => {
                                if (e){
                                    setAltRolls(e.target.value);
                                }

                            }}
                            className="roll-input"
                            placeholder="2d6+1d8+4"
                        />
                        <Button className="roll-action" onClick={() => {
                    let dice_rolls = rollDiceExpression(alt_rolls);
                    console.log(dice_rolls);
                    let final_roll = "";
                    final_roll += "Result = "+dice_rolls.final + "\n Details : \n";
                    dice_rolls.rolls.forEach(roll => {
                        final_roll += roll.dice+" : ( "+roll.results+" ) \n";
                    })

                    setRolledDice(final_roll);
                }}>
                    Roll
                        </Button>
                    </div>
                    { rolled_dice !== "" &&
                    <div className="roll-output">
                        {diceLines.map((dice, index) => {
                            return <div className="roll-output-line" key={`dice-line-${index}`}>{dice}</div>
                        })}
                    </div>

                    }
                </section>

                <section className="roll-card">
                    <div className="roll-card-header">
                        <h3>Encounter Rolls</h3>
                        <span>Generate bracket and encounter count together.</span>
                    </div>
                    <Button className="roll-action" onClick={() => {
                    const rolled_encounter_bracket_temp = getRandomArbitrary(0,100)+1;
                    const rolled_encounter_count_temp = getRandomArbitrary(0,20)+1;
                    setRolledEncounterBracket(rolled_encounter_bracket_temp);
                    setRolledEncounterCount(rolled_encounter_count_temp);

                }}>
                    Roll
                    </Button>
                    <div className="metric-stack">
                        { rolled_encounter_bracket !== -1 &&
                            <div className="metric-row">
                                <span>Encounter bracket</span>
                                <strong className={rolled_encounter_bracket===1 ? 'metric-danger' : rolled_encounter_bracket===100 ? 'metric-success' : ''}>{rolled_encounter_bracket} / 100</strong>
                            </div>
                        }
                        { rolled_encounter_count !== -1 &&
                            <div className="metric-row">
                                <span>Encounter count</span>
                                <strong className={rolled_encounter_count===1 ? 'metric-danger' : rolled_encounter_count===20 ? 'metric-success' : ''}>{rolled_encounter_count} / 20</strong>
                            </div>
                        }
                    </div>
                </section>

                <section className="roll-card">
                    <div className="roll-card-header">
                        <h3>Capture Rolls</h3>
                        <span>Accuracy and capture rate in one throw.</span>
                    </div>
                    <Button className="roll-action" onClick={() => {
                    const roll_capture_accuracy_temp = getRandomArbitrary(0,20)+1;
                    const roll_capture_rate_temp = getRandomArbitrary(0,100)+1;
                    setRollCaptureAccuracy(roll_capture_accuracy_temp);
                    setRollCaptureRate(roll_capture_rate_temp);

                }}>
                    Roll
                    </Button>
                    <div className="metric-stack">
                        { roll_capture_accuracy !== -1 &&
                            <div className="metric-row">
                                <span>Capture accuracy</span>
                                <strong className={roll_capture_accuracy===1 ? 'metric-danger' : roll_capture_accuracy===20 ? 'metric-success' : ''}>{roll_capture_accuracy} / 20</strong>
                            </div>
                        }
                        { roll_capture_rate !== -1 &&
                            <div className="metric-row">
                                <span>Capture rate</span>
                                <strong className={roll_capture_rate===1 ? 'metric-danger' : roll_capture_rate===100 ? 'metric-success' : ''}>{roll_capture_rate} / 100</strong>
                            </div>
                        }
                    </div>
                </section>

                <section className="roll-card roll-card-wide">
                    <div className="roll-card-header">
                        <h3>Shiny Rolls</h3>
                        <span>Set your target number, reroll window, and batch size.</span>
                    </div>
                    <div className="roll-form-grid">
                        <label className="roll-field">
                            <span>Your shiny number</span>
                            <InputNumber
                min={1}
                max={100}
                defaultValue={1}
                value={pokemonShinyRoll}
                onChange={value => {
                    if (value){
                        if (getCookie("pokemonShinyRoll")){
                            eraseCookie("pokemonShinyRoll");
                        }
                        writeCookie("pokemonShinyRoll", value);
                        setPokemonShinyRoll(value);
                    }

                }}
                            className="roll-number"
                            />
                        </label>
                        <label className="roll-field">
                            <span>Dexnav</span>
                            <InputNumber
                    min={1}
                    max={90}
                    defaultValue={1}
                    value={dexnav}
                    onChange={value => {
                        if (value){
                            if (getCookie("dexnav")){
                                eraseCookie("dexnav");
                            }
                            writeCookie("dexnav", value);
                            setDexnav(value);
                        }

                    }}
                            className="roll-number"
                            />
                        </label>
                        <label className="roll-field">
                            <span>Number of dice rolls</span>
                            <InputNumber
                    min={1}
                    max={100}
                    defaultValue={1}
                    value={number_of_shiny_to_roll}
                    onChange={value => {
                        if (value){
                            setNumberOfShinyToRoll(value);
                        }

                    }}
                            className="roll-number"
                            />
                        </label>
                    </div>
                    <Button className="roll-action" onClick={() => {
                    let rolls = [];
                    let final_rolls = [];
                    let reroll_under_or_equal = dexnav;
                    if (pokemonShinyRoll < dexnav){ // if we roll under dexnav, we have to shift the reroll window
                        reroll_under_or_equal += 1;
                    }
                    reroll_under_or_equal = Math.min(90,reroll_under_or_equal);
                    Array(number_of_shiny_to_roll).keys().forEach(key => {
                        rolls.push(getRandomArbitrary(0,100)+1);
                    })

                    while (rolls.length > 0){
                        rolls.map((roll,index) => {
                            if (roll > reroll_under_or_equal || roll === pokemonShinyRoll) {
                                final_rolls.push(roll);
                                rolls.splice(index,1);
                            }
                        })
                        let to_reroll = rolls.length;
                        rolls = [];
                        Array(to_reroll).keys().forEach(key => {
                            rolls.push(getRandomArbitrary(0,100)+1);
                        })
                    }
                    setListRollsShinyPoke(final_rolls);

                }}>
                    Roll
                    </Button>

                { list_rolls_shiny_poke && list_rolls_shiny_poke.length > 0 &&
                    <div className="roll-badge-list">
                        {
                            list_rolls_shiny_poke.map((roll,index) => {
                                const isTarget = roll === pokemonShinyRoll;
                                const isBonus = roll === 100 && list_rolls_shiny_poke.find(poke => {return poke === pokemonShinyRoll});
                                return <span className={`roll-badge ${isTarget ? 'roll-hit' : isBonus ? 'roll-platinum' : ''}`} key={`shiny-roll-${index}`}>{roll}</span>
                            })
                        }

                    </div>
                }
                </section>

                <section className="roll-card roll-card-wide">
                    <div className="roll-card-header">
                        <h3>Card Rolls</h3>
                        <span>Normal, shiny, and platine card outcomes with Dexnav rerolls.</span>
                    </div>
                    <div className="roll-form-grid roll-form-grid-cards">
                        <label className="roll-field">
                            <span>Normal card 1</span>
                            <InputNumber
                    min={1}
                    max={100}
                    defaultValue={1}
                    value={cardRoll1}
                    onChange={value => {
                        if (value){
                            if (getCookie("cardRoll1")){
                                eraseCookie("cardRoll1");
                            }
                            writeCookie("cardRoll1", value);
                            setcardRoll1(value);
                        }

                    }}
                            className="roll-number"
                            />
                        </label>
                        <label className="roll-field">
                            <span>Normal card 2</span>
                            <InputNumber
                    min={1}
                    max={100}
                    defaultValue={1}
                    value={cardRoll2}
                    onChange={value => {
                        if (value){
                            if (getCookie("cardRoll2")){
                                eraseCookie("cardRoll2");
                            }
                            writeCookie("cardRoll2", value);
                            setcardRoll2(value);
                        }

                    }}
                            className="roll-number"
                            />
                        </label>
                        <label className="roll-field">
                            <span>Normal card 3</span>
                            <InputNumber
                    min={1}
                    max={100}
                    defaultValue={1}
                    value={cardRoll3}
                    onChange={value => {
                        if (value){
                            if (getCookie("cardRoll3")){
                                eraseCookie("cardRoll3");
                            }
                            writeCookie("cardRoll3", value);
                            setcardRoll3(value);
                        }

                    }}
                            className="roll-number"
                            />
                        </label>
                        <label className="roll-field">
                            <span>Shiny card 1</span>
                            <InputNumber
                    min={1}
                    max={100}
                    defaultValue={1}
                    value={cardShinyRoll1}
                    onChange={value => {
                        if (value){
                            if (getCookie("cardShinyRoll1")){
                                eraseCookie("cardShinyRoll1");
                            }
                            writeCookie("cardShinyRoll1", value);
                            setcardShinyRoll1(value);
                        }

                    }}
                            className="roll-number"
                            />
                        </label>
                        <label className="roll-field">
                            <span>Shiny card 2</span>
                            <InputNumber
                    min={1}
                    max={100}
                    defaultValue={1}
                    value={cardShinyRoll2}
                    onChange={value => {
                        if (value){
                            if (getCookie("cardShinyRoll2")){
                                eraseCookie("cardShinyRoll2");
                            }
                            writeCookie("cardShinyRoll2", value);
                            setcardShinyRoll2(value);
                        }

                    }}
                            className="roll-number"
                            />
                        </label>
                        <label className="roll-field roll-field-toggle">
                            <span>Shiny status</span>
                            <Checkbox
                    checked={is_pokemon_shiny}
                    onChange={e => {
                        setIsPokemonShiny(e.target.checked);
                }}>
                    Is caught pokemon shiny ?
                            </Checkbox>
                        </label>
                        <label className="roll-field">
                            <span>Platine card</span>
                            <InputNumber
                    min={1}
                    max={100}
                    defaultValue={1}
                    value={cardPlatineRoll1}
                    onChange={value => {
                        if (value){
                            if (getCookie("cardPlatineRoll1")){
                                eraseCookie("cardPlatineRoll1");
                            }
                            writeCookie("cardPlatineRoll1", value);
                            setcardPlatineRoll1(value);
                        }

                    }}
                            className="roll-number"
                            />
                        </label>
                        <label className="roll-field roll-field-toggle">
                            <span>Platine status</span>
                            <Checkbox
                checked={is_pokemon_platine}
                onChange={e => {
                    setIsPokemonPlatine(e.target.checked);
                }}>
                Is caught pokemon platine ?
                            </Checkbox>
                        </label>
                        <label className="roll-field">
                            <span>Card Dexnav</span>
                            <InputNumber
                    min={0}
                    max={90}
                    defaultValue={1}
                    value={card_dexnav}
                    onChange={value => {
                        if (value){
                            if (getCookie("card_dexnav")){
                                eraseCookie("card_dexnav");
                            }
                            writeCookie("card_dexnav", value);
                            setCardDexnav(value);
                        }

                    }}
                            className="roll-number"
                            />
                        </label>
                        <label className="roll-field">
                            <span>Number of dice rolls</span>
                            <InputNumber
                    min={1}
                    max={100}
                    defaultValue={1}
                    value={number_of_cards_to_roll}
                    onChange={value => {
                        if (value){
                            setNumberOfCardsToRoll(value);
                        }

                    }}
                            className="roll-number"
                            />
                        </label>
                    </div>
                    <Button className="roll-action" onClick={() => {
                    let rolls = [];
                    let final_rolls = [];
                    let reroll_under_or_equal = card_dexnav;
                    if (cardRoll1 < card_dexnav){ // if we roll under dexnav, we have to shift the reroll window
                        reroll_under_or_equal += 1;
                    }
                    if (cardRoll2 < card_dexnav){ // if we roll under dexnav, we have to shift the reroll window
                        reroll_under_or_equal += 1;
                    }
                    if (cardRoll3 < card_dexnav){ // if we roll under dexnav, we have to shift the reroll window
                        reroll_under_or_equal += 1;
                    }
                    if (cardShinyRoll1 < card_dexnav){ // if we roll under dexnav, we have to shift the reroll window
                        reroll_under_or_equal += 1;
                    }

                    if (cardShinyRoll2 < card_dexnav){ // if we roll under dexnav, we have to shift the reroll window
                        reroll_under_or_equal += 1;
                    }
                    if (cardPlatineRoll1 < card_dexnav){ // if we roll under dexnav, we have to shift the reroll window
                        reroll_under_or_equal += 1;
                    }
                    reroll_under_or_equal = Math.min(90,reroll_under_or_equal);


                    Array(number_of_cards_to_roll).keys().forEach(key => {
                        rolls.push(getRandomArbitrary(0,100)+1);
                    })
                    while (rolls.length > 0){
                        rolls.map((roll,index) => {
                            if (roll > reroll_under_or_equal ||
                                roll === cardRoll1 ||
                                roll === cardRoll2 ||
                                roll === cardRoll3 ||
                                ((is_pokemon_platine || is_pokemon_shiny) && (roll === cardShinyRoll1 || roll === cardShinyRoll2)) ||
                                (is_pokemon_platine && (roll === cardPlatineRoll1))
                            ) {
                                final_rolls.push(roll);
                                rolls.splice(index,1);
                            }
                        })
                        let to_reroll = rolls.length;
                        rolls = [];
                        Array(to_reroll).keys().forEach(key => {
                            rolls.push(getRandomArbitrary(0,100)+1);
                        })
                    }
                    setListRollsNormalCards(final_rolls);

                }}>
                    Roll
                    </Button>
                {
                list_rolls_normal_cards && list_rolls_normal_cards.length > 0 &&
                <div className="roll-badge-list">
                    {
                        list_rolls_normal_cards.map((roll,index) => {
                            const isNormal = roll===cardRoll1||roll===cardRoll2||roll===cardRoll3;
                            const isShiny = (is_pokemon_platine || is_pokemon_shiny )&& (roll===cardShinyRoll1||roll===cardShinyRoll2);
                            const isPlatine = is_pokemon_platine && (roll===cardPlatineRoll1);
                            return <span className={`roll-badge ${isNormal ? 'roll-hit' : isShiny ? 'roll-shiny' : isPlatine ? 'roll-platinum' : ''}`} key={`card-roll-${index}`}>{roll}</span>
                        })
                    }
                </div>
                }
                </section>
            </div>
        </div>
    );
}

export default Rolls;
