import { useSelector,useDispatch } from "react-redux";
import Form from 'react-bootstrap/Form';
import React, {useEffect, useState} from "react";
import './PokemonGenerator.css';
import movesData from "../data/moves.json";
import pokemonsData from "../data/pokemon.json";
import abilitiesData from "../data/abilities.json";
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import {AutoComplete, InputNumber, Dropdown, Select} from 'antd';
import {
    addMovePokemonTMHMMoves,removeMovePokemonTMHMMoves,addMovePokemonChosenMoves, addMovePokemonEggMoves, addMovePokemonLockedEggMoves, addMovePokemonLockedMoves,
    choose_pokemon, decrement_remaining_rolls, removeMovePokemonChosenMoves, removeMovePokemonEggMoves,
    removeMovePokemonLockedEggMoves, removeMovePokemonLockedMoves,
    setAdvancedAbility, setBaseAbility,
    setBuffedStat,
    setCard,
    setGender, setHighAbility,
    setLevel, setLoweredStat, setPointsByStat, setPokemonChosenMoves,
    setRarity
} from "../features/pokemon/pokemonSlice.jsx";
import {DropdownButton} from "react-bootstrap";

function download(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        var a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
function PokemonGenerator() {

    const NATURE_MATRIX = {
        "HP": {
            "ATK": "Cuddly (+HP/-ATK)",
            "DEF": "Distracted (+HP/-DEF)",
            "SPATK": "Proud (+HP/-SPATK)",
            "SPDEF": "Decisive (+HP/-SPDEF)",
            "SPD": "Patient (+HP/-SPD)",
            "HP": "Neutral (+HP/-HP)",
        },

        "ATK": {
            "HP": "Desperate (+ATK/-HP)",
            "DEF": "Lonely (+ATK/-DEF)",
            "SPATK": "Adamant (+ATK/-SPATK)",
            "SPDEF": "Naughty (+ATK/-SPDEF)",
            "SPD": "Brave (+ATK/-SPD)",
            "ATK": "Neutral (+ATK/-ATK)",
        },

        "DEF": {
            "HP": "Stark (+DEF/-HP)",
            "ATK": "Bold (+DEF/-ATK)",
            "SPATK": "Impish (+DEF/-SPATK)",
            "SPDEF": "Lax (+DEF/-SPDEF)",
            "SPD": "Relaxed (+DEF/-SPD)",
            "DEF": "Neutral (+DEF/-DEF)",
        },

        "SPATK": {
            "HP": "Curious (+SPATK/-HP)",
            "ATK": "Modest (+SPATK/-ATK)",
            "DEF": "Mild (+SPATK/-DEF)",
            "SPDEF": "Rash (+SPATK/-SPDEF)",
            "SPD": "Quiet (+SPATK/-SPD)",
            "SPATK": "Neutral (+SPATK/-SPATK)",
        },

        "SPDEF": {
            "HP": "Dreamy (+SPDEF/-HP)",
            "ATK": "Calm (+SPDEF/-ATK)",
            "DEF": "Gentle (+SPDEF/-DEF)",
            "SPATK": "Careful (+SPDEF/-SPATK)",
            "SPD": "Sassy (+SPDEF/-SPD)",
            "SPDEF": "Neutral (+SPDEF/-SPDEF)",
        },

        "SPD": {
            "HP": "Skittish (+SPD/-HP)",
            "ATK": "Timid (+SPD/-ATK)",
            "DEF": "Hasty (+SPD/-DEF)",
            "SPATK": "Jolly (+SPD/-SPATK)",
            "SPDEF": "Naive (+SPD/-SPDEF)",
            "SPD": "Neutral (+SPD/-SPD)",
        },
    };
    const rarity_options = ["","Normal","Shiny","Platine"]
    const cards_options = ["","None","Normal","Shiny","Platine"]
    const gender_options = ["","Genderless","Male","Female"]
    const nature_options = ["","HP","ATK","DEF","SPATK","SPDEF","SPD"]
    const dispatch = useDispatch();
    let hp_auto_buff = 0;
    let atk_auto_buff = 0;
    let def_auto_buff = 0;
    let spatk_auto_buff = 0;
    let spdef_auto_buff = 0;
    let spd_auto_buff = 0;
    let bonus_point_nature_stat = 2;
    const [moves, setMoves] = useState([]);
    const [pokemons, setPokemons] = useState([]);
    const [abilities, setAbilities] = useState([]);
    let final_hp = 0;
    let final_atk = 0;
    let final_def = 0;
    let final_spatk = 0;
    let final_spdef = 0;
    let final_speed = 0;

    const choosen_pokemon = useSelector((state) => state.pokemon.chosen_pokemon);
    const gender = useSelector((state) => state.pokemon.pokemon_gender);
    const points_by_stats = useSelector((state) => state.pokemon.pokemon_points_by_stats);
    const level = useSelector((state) => state.pokemon.pokemon_level);
    pokemons.sort((a,b) => a.name > b.name);
    const pokemon_obj = pokemons.filter(pokemon => pokemon.name === choosen_pokemon)[0];
    if (pokemon_obj  && gender === "" && pokemon_obj) {
        if (pokemon_obj["gender_ratio_m"] === -1){
            dispatch(setGender({pokemon_gender:"Genderless"}));
        }
        else {
            dispatch(setGender({pokemon_gender:""}));
        }

    }
    let final_tm_moves= [];
    if (pokemon_obj) {
        if (pokemon_obj["tm_moves"].length > 0) {

            pokemon_obj["tm_moves"].forEach(move => {
                const matched_move = moves.find(move_obj => move_obj["move"] === move);
                if (matched_move) {
                    final_tm_moves.push(matched_move);
                }
            })
        }

        if (final_tm_moves.length === 0) {
            final_tm_moves = moves;
        }
    }
    let final_egg_moves = [];
    if (pokemon_obj){
        if (pokemon_obj["egg_moves"].length > 0){

            pokemon_obj["egg_moves"].forEach(move => {
                const matched_move = moves.find(move_obj => move_obj["move"] === move);
                if (matched_move){
                    final_egg_moves.push(matched_move);
                }
            })
        }
        else {
            if (pokemon_obj["evolutions"].length > 0){
                let next_poke = pokemon_obj["evolutions"][0];
                let next_poke_obj = pokemons.find(poke => poke["name"] === next_poke.toLocaleLowerCase())
                if (next_poke_obj){
                    if (next_poke_obj["egg_moves"].length > 0){
                        next_poke_obj["egg_moves"].forEach(move => {
                            const matched_move = moves.find(move_obj => move_obj["move"] === move);
                            if (matched_move){
                                final_egg_moves.push(matched_move);
                            }
                        })
                    }
                }
            }
        }

        if (final_egg_moves.length === 0) {
            final_egg_moves = moves;
        }
    }
    let pokemon_moves_available = [];
    if (pokemon_obj  && level > 0){
        pokemon_moves_available = pokemon_obj["moves"].filter(a => a["level"] <= level).sort((a, b) => a["level"] < b["level"]);
    }
    pokemon_moves_available = [{"name":"","level":-1,"type":""},...pokemon_moves_available];
    pokemon_moves_available.sort((a,b) => a.level > b.level);

    let available_points = 9+level;
    for (let stat in points_by_stats){
        available_points -= points_by_stats[stat];
    }
    const final_buffed_stat = useSelector((state) => state.pokemon.pokemon_final_buffed_stat);
    const chosen_moves = useSelector((state) => state.pokemon.pokemon_chosen_moves);
    const egg_moves = useSelector((state) => state.pokemon.pokemon_chosen_egg_moves);
    const tmhm_moves = useSelector((state) => state.pokemon.pokemon_chosen_tmhm_moves);
    const locked_egg_moves = useSelector((state) => state.pokemon.pokemon_locked_egg_moves);
    const final_lowered_stat = useSelector((state) => state.pokemon.pokemon_final_lowered_stat);
    const rarity = useSelector((state) => state.pokemon.pokemon_rarity);
    const card = useSelector((state) => state.pokemon.pokemon_card);
    const base_ability = useSelector((state) => state.pokemon.pokemon_base_ability);
    const advanced_ability = useSelector((state) => state.pokemon.pokemon_advanced_ability);
    const high_ability = useSelector((state) => state.pokemon.pokemon_high_ability);

    if (pokemon_obj  && rarity !== "" && card !== "" && final_buffed_stat !== "" && final_lowered_stat !== ""){
        let to_add = 0;
        if (card !== "None"){
            if (card === "Normal"){
                to_add = 1;
            }
            else if (card === "Shiny"){
                to_add = 2;
            }
            else if (card === "Platine"){
                to_add = 3;
            }
            hp_auto_buff += to_add;
            atk_auto_buff += to_add;
            def_auto_buff += to_add;
            spatk_auto_buff += to_add;
            spdef_auto_buff += to_add;
            spd_auto_buff += to_add;
            bonus_point_nature_stat += 1
        }

        to_add = 0;
        if (rarity === "Shiny"){
            to_add = 2;
        }
        else if (rarity === "Platine"){
            to_add = 4;
        }
        hp_auto_buff += to_add;
        atk_auto_buff += to_add;
        def_auto_buff += to_add;
        spatk_auto_buff += to_add;
        spdef_auto_buff += to_add;
        spd_auto_buff += to_add;

        if (final_buffed_stat === "HP"){
            hp_auto_buff += bonus_point_nature_stat;
        }
        else if (final_buffed_stat === "ATK"){
            atk_auto_buff += bonus_point_nature_stat;
        }
        else if (final_buffed_stat === "DEF"){
            def_auto_buff += bonus_point_nature_stat;
        }
        else if (final_buffed_stat === "SPATK"){
            spatk_auto_buff += bonus_point_nature_stat;
        }
        else if (final_buffed_stat === "SPDEF"){
            spdef_auto_buff += bonus_point_nature_stat;
        }
        else if (final_buffed_stat === "SPD"){
            spd_auto_buff += bonus_point_nature_stat;
        }

        if (final_lowered_stat === "HP"){
            hp_auto_buff = hp_auto_buff - bonus_point_nature_stat;
        }
        else if (final_lowered_stat === "ATK"){
            atk_auto_buff = atk_auto_buff - bonus_point_nature_stat;
        }
        else if (final_lowered_stat === "DEF"){
            def_auto_buff = def_auto_buff - bonus_point_nature_stat;
        }
        else if (final_lowered_stat === "SPATK"){
            spatk_auto_buff = spatk_auto_buff - bonus_point_nature_stat;
        }
        else if (final_lowered_stat === "SPDEF"){
            spdef_auto_buff = spdef_auto_buff - bonus_point_nature_stat;
        }
        else if (final_lowered_stat === "SPD"){
            spd_auto_buff = spd_auto_buff - bonus_point_nature_stat;
        }
    }

    if (rarity !== "" && card !== "" && final_buffed_stat !== "" && final_lowered_stat !== "" && (level > 0 && available_points === 0)) {
        final_hp = Math.max(0,pokemon_obj["stat_hp"]+hp_auto_buff+points_by_stats["HP"])
        final_atk = Math.max(0,pokemon_obj["stat_atk"]+atk_auto_buff+points_by_stats["ATK"])
        final_def = Math.max(0,pokemon_obj["stat_def"]+def_auto_buff+points_by_stats["DEF"])
        final_spatk = Math.max(0,pokemon_obj["stat_sp_atk"]+spatk_auto_buff+points_by_stats["SPATK"])
        final_spdef = Math.max(0,pokemon_obj["stat_sp_def"]+spdef_auto_buff+points_by_stats["SPDEF"])
        final_speed = Math.max(0,pokemon_obj["stat_spd"]+spd_auto_buff+points_by_stats["SPD"])
    }

    const remaining_rolls = useSelector((state) => state.pokemon.remaining_rolls);
    const img_pokemon_src = "https://img.pokemondb.net/artwork/"+choosen_pokemon+".jpg"
    const local_png_img = "/images/"+choosen_pokemon.toLowerCase().replace(" ","_")+".png"
    useEffect(() => {
        setMoves(movesData);
        setPokemons(pokemonsData);
        setAbilities(abilitiesData);
    }, []);

    const ready_to_generate = (level > 0 && rarity !== "" && card !== "" && gender !== "" && final_buffed_stat !== "" && final_lowered_stat !== "" && available_points <= 0)
    return (
        <div className="pokemon-generator-page">
            {
                choosen_pokemon && pokemon_obj &&
                <div className="pokemon-generator-sidebar">
                    <img className="pokemon-generator-image" style={{height:"300px"}} src={local_png_img}></img><br/>
                    <br></br>
                    <br></br>
                    Base Stats :
                    <Table responsive className="pokemon-generator-table" style={{borderColor:'white',borderWidth:'1px',borderStyle:'solid',minWidth:'90%',maxWidth:'90%'}}>
                        <thead>
                        <tr>
                            <th>Stat</th>
                            <th>Value</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <th>HP</th>
                            <th>{pokemon_obj["stat_hp"]}</th>
                        </tr>
                        <tr>
                            <th>ATK</th>
                            <th>{pokemon_obj["stat_atk"]}</th>
                        </tr>
                        <tr>
                            <th>DEF</th>
                            <th>{pokemon_obj["stat_def"]}</th>
                        </tr>
                        <tr>
                            <th>SPATK</th>
                            <th>{pokemon_obj["stat_sp_atk"]}</th>
                        </tr>
                        <tr>
                            <th>SPDEF</th>
                            <th>{pokemon_obj["stat_sp_def"]}</th>
                        </tr>
                        <tr>
                            <th>SPD</th>
                            <th>{pokemon_obj["stat_spd"]}</th>
                        </tr>
                        </tbody>
                    </Table>
                    <br></br>
                    <br></br>
                    Card and rarity buffs :
                    <Table responsive className="pokemon-generator-table" style={{borderColor:'white',borderWidth:'1px',borderStyle:'solid',minWidth:'90%',maxWidth:'90%'}}>
                        <thead>
                        <tr>
                            <th>Stat</th>
                            <th>Buffs</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <th>HP</th>
                            <th>{(hp_auto_buff>0?"+"+hp_auto_buff:hp_auto_buff)}</th>
                        </tr>
                        <tr>
                            <th>ATK</th>
                            <th> {(atk_auto_buff>0?"+"+atk_auto_buff:atk_auto_buff)}</th>
                        </tr>
                        <tr>
                            <th>DEF</th>
                            <th>{(def_auto_buff>0?"+"+def_auto_buff:def_auto_buff)}</th>
                        </tr>
                        <tr>
                            <th>SPATK</th>
                            <th>{(spatk_auto_buff>0?"+"+spatk_auto_buff:spatk_auto_buff)}</th>
                        </tr>
                        <tr>
                            <th>SPDEF</th>
                            <th>{(spdef_auto_buff>0?"+"+spdef_auto_buff:spdef_auto_buff)}</th>
                        </tr>
                        <tr>
                            <th>SPD</th>
                            <th>{(spd_auto_buff>0?"+"+spd_auto_buff:spd_auto_buff)}</th>
                        </tr>
                        </tbody>
                    </Table>
                    <br></br>
                    <br></br>
                    Final stats :
                    <Table responsive className="pokemon-generator-table" style={{borderColor:'white',borderWidth:'1px',borderStyle:'solid',minWidth:'90%',maxWidth:'90%'}}>
                        <thead>
                        <tr>
                            <th>Stat</th>
                            <th>Buffs</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <th>HP</th>
                            <th>{final_hp}</th>
                        </tr>
                        <tr>
                            <th>ATK</th>
                            <th> {final_atk}</th>
                        </tr>
                        <tr>
                            <th>DEF</th>
                            <th>{final_def}</th>
                        </tr>
                        <tr>
                            <th>SPATK</th>
                            <th>{final_spatk}</th>
                        </tr>
                        <tr>
                            <th>SPDEF</th>
                            <th>{final_spdef}</th>
                        </tr>
                        <tr>
                            <th>SPD</th>
                            <th>{final_speed}</th>
                        </tr>
                        </tbody>
                    </Table>
                    <br></br>
                    <br></br>
                    <Table responsive className="pokemon-generator-table" style={{borderColor:'white',borderWidth:'1px',borderStyle:'solid',minWidth:'90%',maxWidth:'90%'}}>
                        <tbody>
                        <tr>
                            <th>Base Ability</th>
                            <th>{base_ability}</th>
                        </tr>
                        <tr>
                            <th>Advanced ability</th>
                            <th> {advanced_ability?advanced_ability:"/"}</th>
                        </tr>
                        <tr>
                            <th>High ability</th>
                            <th>{high_ability?high_ability:"/"}</th>
                        </tr>
                        </tbody>
                    </Table>
                </div>
            }

            <div className="pokemon-generator-main">
                <h1 className="pokemon-generator-title">Pokemon Generator</h1>


                Pokemon : <Select
                showSearch
                style={{width:'30%',height:'30px'}}
                value={choosen_pokemon}
                options={pokemons.map((pokemon) => {return {"value":pokemon.name,"label":pokemon.name} })}
                onChange={(e) => dispatch(choose_pokemon({chosen_pokemon:e}))}>

            </Select>
                {
                    choosen_pokemon && pokemon_obj &&
                    <div>
                        Level : <InputNumber
                        min={1}
                        max={150}
                        defaultValue={1}
                        value={level}
                        onChange={(value) => dispatch(setLevel({pokemon_level:value}))}
                        style={{marginTop:'5px',width:'30%',height:'30px'}}>
                    </InputNumber> <br></br>
                        Rarity : <Select
                        showSearch
                        style={{marginTop:'5px',width:'30%',height:'30px'}}
                        value={rarity}
                        options={rarity_options.map(rarity => {
                                return {"value":rarity,"label":rarity}
                            }
                        )}
                        onChange={(value) => dispatch(setRarity({pokemon_rarity:value}))}>

                    </Select><br></br>
                        Card : <Select
                        showSearch
                        options={cards_options.map(rarity => {
                            return {"value":rarity,"label":rarity}}
                        )}
                        style={{marginTop:'5px',width:'30%',height:'30px'}}
                        value={card}
                        onChange={(value) => dispatch(setCard({pokemon_card:value}))}>

                    </Select><br></br>
                        Gender : <Form.Select
                        style={{marginTop:'5px',width:'30%',height:'30px'}}
                        disabled={true}
                        value={gender}>
                        {gender_options.map(rarity =>
                            <option value={rarity} key={rarity}>{rarity}</option>
                        )}
                    </Form.Select><Button disabled={gender!==""} style={{marginLeft:'5px',marginRight:'5px',marginTop:'5px',width:'5%',height:'30px'}} onClick={() => {
                        let roll_male = parseFloat(pokemon_obj["gender_ratio_m"]);
                        let roll = getRandomArbitrary(0,100);
                        dispatch(setGender({pokemon_gender:(roll <roll_male?"Male":"Female")}));
                    }}> Roll </Button><br></br>
                        <br></br>Nature<br></br>
                        Buff : <Select
                        showSearch
                        options={nature_options.map(rarity =>{
                            return {"value":rarity,"label":rarity}}
                        )}
                        style={{marginTop:'5px',width:'10%',height:'30px',marginRight:'5px'}}
                        onChange={(value) => dispatch(setBuffedStat({pokemon_final_buffed_stat:value}))}
                        value={final_buffed_stat}>
                    </Select>
                        Debuff : <Select
                        showSearch
                        options={nature_options.map(rarity =>{
                                return {"value":rarity,"label":rarity}
                            }
                        )}
                        style={{marginLeft:'5px',marginTop:'5px',width:'10%',height:'30px'}}
                        onChange={(value) => dispatch(setLoweredStat({pokemon_final_lowered_stat:value}))}
                        value={final_lowered_stat}>

                    </Select> <Button disabled={remaining_rolls<=0}
                                      style={{marginLeft:'5px',marginTop:'5px',width:'5%',height:'30px'}} onClick={() => {
                        dispatch(decrement_remaining_rolls());
                        let buff_roll = getRandomArbitrary(0,6)+1;
                        let debuff_roll = getRandomArbitrary(0,6)+1;
                        dispatch(setBuffedStat({pokemon_final_buffed_stat:nature_options[buff_roll]}));
                        dispatch(setLoweredStat({pokemon_final_lowered_stat:nature_options[debuff_roll]}));
                    }}> Roll </Button>
                        { final_buffed_stat !== "" && final_buffed_stat !== "" &&
                            <><br></br><br></br><h style={{marginLeft:'30px'}}>Nature chosen : {NATURE_MATRIX[final_buffed_stat][final_lowered_stat]}</h></>
                        }
                        {
                            pokemon_obj && level > 0 &&
                            <div><br></br>
                                Base Ability : <Select
                                    showSearch
                                    options={["",...pokemon_obj["base_abilities"]].map(rarity => {
                                        return {"value":rarity,"label":rarity}}
                                    )}
                                    style={{marginTop:'5px',width:'30%',height:'30px'}}
                                    value={base_ability}
                                    onChange={(value) => {if (value !== "") {dispatch(setBaseAbility({pokemon_base_ability:value}));} return "";}}>
                                </Select><Button disabled={base_ability!==""} style={{marginLeft:'5px',marginRight:'5px',marginTop:'5px',width:'5%',height:'30px'}} onClick={() => {
                                    const base_abilities = pokemon_obj["base_abilities"]
                                    if (base_abilities.length > 0){
                                        let roll = getRandomArbitrary(0,base_abilities.length);
                                        dispatch(setBaseAbility({pokemon_base_ability:base_abilities[roll]}));
                                    }
                                }}> Roll </Button></div>
                        }

                        {
                            pokemon_obj && level >= 20 &&
                            <div><br></br>
                                Advanced Ability : <Select
                                    showSearch
                                    options={["",...pokemon_obj["advanced_abilities"]].map(rarity => {
                                        return {"value":rarity,"label":rarity}}
                                    )}
                                    style={{marginTop:'5px',width:'30%',height:'30px'}}
                                    value={advanced_ability}
                                    onChange={(value) => {if (value !== "") {dispatch(setAdvancedAbility({pokemon_advanced_ability:value}));} return "";}}>
                                </Select><Button disabled={advanced_ability!==""} style={{marginLeft:'5px',marginRight:'5px',marginTop:'5px',width:'5%',height:'30px'}} onClick={() => {
                                    const base_abilities = pokemon_obj["advanced_abilities"]
                                    if (base_abilities.length > 0){
                                        let roll = getRandomArbitrary(0,base_abilities.length);
                                        dispatch(setAdvancedAbility({pokemon_advanced_ability:base_abilities[roll]}));
                                    }
                                }}> Roll </Button></div>
                        }

                        {
                            pokemon_obj && level >= 40 &&
                            <div><br></br>
                                High Ability : <Select
                                    showSearch
                                    options={["",...pokemon_obj["high_abilities"]].map(rarity => {
                                        return {"value":rarity,"label":rarity}}
                                    )}
                                    style={{marginTop:'5px',width:'30%',height:'30px'}}
                                    value={high_ability}
                                    onChange={(value) => {if (value !== "") {dispatch(setHighAbility({pokemon_high_ability:value}));} return "";}}>
                                </Select><Button disabled={high_ability!==""} style={{marginLeft:'5px',marginRight:'5px',marginTop:'5px',width:'5%',height:'30px'}} onClick={() => {
                                    const base_abilities = pokemon_obj["high_abilities"]
                                    if (base_abilities.length > 0){
                                        let roll = getRandomArbitrary(0,base_abilities.length);
                                        dispatch(setHighAbility({pokemon_high_ability:base_abilities[roll]}));
                                    }
                                }}> Roll </Button></div>
                        }

                        <br></br><h2>Level up points :</h2>
                        Available points : {available_points}<br></br>
                        HP <InputNumber onChange={(value) => dispatch(setPointsByStat({pokemon_points_by_stats:{"HP":value}}))} style={{width:50,marginRight:'3px'}} disabled={available_points<=0 || level === -1} min={0} max={available_points} value={points_by_stats["HP"]} defaultValue={0}></InputNumber>
                        ATK <InputNumber onChange={(value) => dispatch(setPointsByStat({pokemon_points_by_stats:{"ATK":value}}))} style={{width:50,marginRight:'3px'}} disabled={available_points<=0 || level === -1} min={0} max={available_points} value={points_by_stats["ATK"]} defaultValue={0}></InputNumber>
                        DEF <InputNumber onChange={(value) => dispatch(setPointsByStat({pokemon_points_by_stats:{"DEF":value}}))} style={{width:50,marginRight:'3px'}} disabled={available_points<=0 || level === -1} min={0} max={available_points} value={points_by_stats["DEF"]} defaultValue={0}></InputNumber>
                        SPATK <InputNumber onChange={(value) => dispatch(setPointsByStat({pokemon_points_by_stats:{"SPATK":value}}))} style={{width:50,marginRight:'3px'}} disabled={available_points<=0 || level === -1} min={0} max={available_points} value={points_by_stats["SPATK"]} defaultValue={0}></InputNumber>
                        SPDEF <InputNumber onChange={(value) => dispatch(setPointsByStat({pokemon_points_by_stats:{"SPDEF":value}}))} style={{width:50,marginRight:'3px'}} disabled={available_points<=0 || level === -1} min={0} max={available_points} value={points_by_stats["SPDEF"]} defaultValue={0}></InputNumber>
                        SPD <InputNumber onChange={(value) => dispatch(setPointsByStat({pokemon_points_by_stats:{"SPD":value}}))} style={{width:50,marginRight:'3px'}} disabled={available_points<=0 || level === -1} min={0} max={available_points} value={points_by_stats["SPD"]} defaultValue={0}></InputNumber>
                        <Button disabled={level===-1} style={{marginLeft:'5px',marginTop:'5px',width:'5%',height:'30px'}} onClick={() => {
                            dispatch(setPointsByStat({pokemon_points_by_stats:{"HP":0,"ATK":0,"DEF":0,"SPATK":0,"SPDEF":0,"SPD":0}}));
                        }}> Reset </Button>
                        <Button disabled={level===-1} style={{marginLeft:'5px',marginTop:'5px',width:'5%',height:'30px'}} onClick={() => {
                            const hp_stat = pokemon_obj["stat_hp"];
                            let points_to_give = available_points;
                            const atk_stat = pokemon_obj["stat_atk"];
                            const def_stat = pokemon_obj["stat_def"];
                            const spatk_stat = pokemon_obj["stat_sp_atk"];
                            const spdef_stat = pokemon_obj["stat_sp_def"];
                            const spd_stat = pokemon_obj["stat_spd"];
                            const sum_poke_points = hp_stat+atk_stat+def_stat+spatk_stat+spdef_stat+spd_stat;
                            const hp_weight = parseFloat(hp_stat)/parseFloat(sum_poke_points);
                            const atk_weight = parseFloat(atk_stat)/parseFloat(sum_poke_points);
                            const def_weight = parseFloat(def_stat)/parseFloat(sum_poke_points);
                            const spatk_weight = parseFloat(spatk_stat)/parseFloat(sum_poke_points);
                            const spdef_weight = parseFloat(spdef_stat)/parseFloat(sum_poke_points);
                            const spd_weight = parseFloat(spd_stat)/parseFloat(sum_poke_points);
                            let point_in_hp = Math.round(available_points*hp_weight);
                            points_to_give -= point_in_hp;
                            let point_in_atk = Math.round(available_points*atk_weight);
                            points_to_give -= point_in_atk;
                            let point_in_def = Math.round(available_points*def_weight);
                            points_to_give -= point_in_def;
                            let point_in_spatk = Math.round(available_points*spatk_weight);
                            points_to_give -= point_in_spatk;
                            let point_in_spdef = Math.round(available_points*spdef_weight);
                            points_to_give -= point_in_spdef;
                            let point_in_spd = Math.min(points_to_give,Math.round(available_points*spd_weight));
                            points_to_give -= point_in_spd;
                            const roll_for_hp = Math.round(hp_weight*100)
                            const roll_for_atk = Math.round(atk_weight*100)+roll_for_hp
                            const roll_for_def = Math.round(def_weight*100)+roll_for_atk
                            const roll_for_spatk = Math.round(spatk_weight*100)+roll_for_def
                            const roll_for_spdef = Math.round(spdef_weight*100)+roll_for_spatk
                            const roll_for_speed = Math.min(100,Math.round(spd_weight*100)+roll_for_spdef)
                            while (points_to_give > 0) {
                                let roll = getRandomArbitrary(0,100);
                                if (roll < roll_for_hp) {
                                    point_in_hp += 1;
                                    points_to_give -= 1;
                                }
                                else if (roll < roll_for_atk) {
                                    point_in_atk += 1;
                                    points_to_give -= 1;
                                }
                                else if (roll < roll_for_def) {
                                    point_in_def += 1;
                                    points_to_give -= 1;
                                }
                                else if (roll < roll_for_spatk) {
                                    point_in_spatk += 1;
                                    points_to_give -= 1;
                                }
                                else if (roll < roll_for_spdef) {
                                    point_in_spdef += 1;
                                    points_to_give -= 1;
                                }
                                else if (roll < roll_for_speed) {
                                    point_in_spd += 1;
                                    points_to_give -= 1;
                                }
                            }
                            dispatch(setPointsByStat({pokemon_points_by_stats:{"HP":point_in_hp,"ATK":point_in_atk,"DEF":point_in_def,"SPATK":point_in_spatk,"SPDEF":point_in_spdef,"SPD":point_in_spd}}));
                        }}> Auto </Button>
                        <br></br>
                        <br></br>

                        {
                            level > 0 &&
                            <div>
                                <h2> Moves : </h2>
                                <Table responsive style={{borderColor:'white',borderWidth:'1px',borderStyle:'solid',minWidth:'70%',maxWidth:'70%'}}>
                                    <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Freq</th>
                                        <th>AC</th>
                                        <th>Type</th>
                                        <th>Roll</th>
                                        <th>Dmg Type</th>
                                        <th>Range</th>
                                        <th>Effect</th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {Array(6).keys().map(key => {
                                        if (key < chosen_moves.length){
                                            const final_roll = (chosen_moves[key]["roll"].includes("/")?chosen_moves[key]["roll"].split("/")[0]:chosen_moves[key]["roll"]);
                                            return <tr>
                                                <th>{chosen_moves[key]["move"]}</th>
                                                <th>{chosen_moves[key]["frequency"]}</th>
                                                <th>{chosen_moves[key]["AC"]}</th>
                                                <th>{chosen_moves[key]["type"]}</th>
                                                <th>{final_roll}</th>
                                                <th>{chosen_moves[key]["classe"]}</th>
                                                <th>{chosen_moves[key]["range"]}</th>
                                                <th>{chosen_moves[key]["effect"]}</th>
                                                <th><Button disabled={level===-1} style={{marginLeft:'5px',marginTop:'5px',height:'30px'}} onClick={() => {
                                                    let index_to_remove = chosen_moves.findIndex(move_c => move_c["move"] === chosen_moves[key]["move"]);
                                                    if (index_to_remove > -1) {
                                                        dispatch(removeMovePokemonChosenMoves({pokemon_chosen_moves: index_to_remove}));
                                                    }
                                                }}> remove </Button></th>
                                            </tr>
                                        }
                                        else {
                                            return <tr>
                                                <th></th>
                                                <th></th>
                                                <th></th>
                                                <th></th>
                                                <th></th>
                                                <th></th>
                                                <th></th>
                                                <th></th>
                                                <th></th>
                                            </tr>
                                        }
                                    })}
                                    </tbody>
                                </Table>
                                <br></br>
                            </div>
                        }

                        {
                            level > 0 &&
                            <div>
                                Add Moves :
                                <Select
                                    showSearch
                                    options={pokemon_moves_available.map(move => {
                                        return {"value":move["name"].replace(':','').trim(),"label":(move["name"]===""?"":"lvl "+move["level"]+" - "+move["name"]+" ("+move["type"]+")")}})}
                                    defaultValue={""}
                                    style={{marginLeft:'5px',marginTop:'5px',width:'30%',height:'30px'}}
                                    onChange={(value) => {
                                        let move_name = value.replace(':','').trim();
                                        if (move_name !== "") {
                                            let index_to_remove = chosen_moves.findIndex(move_c => move_c["move"] === move_name);
                                            if (index_to_remove > -1) {
                                                dispatch(removeMovePokemonChosenMoves({pokemon_chosen_moves: index_to_remove}));
                                            }
                                            else {
                                                let moves_to_add = moves.find((m) => m["move"] === move_name);
                                                if (moves_to_add && chosen_moves.length < 6) {
                                                    dispatch(addMovePokemonChosenMoves({pokemon_chosen_moves: moves_to_add}));
                                                }
                                                else if (chosen_moves.length < 6) {
                                                    dispatch(addMovePokemonChosenMoves({pokemon_chosen_moves: {move:move_name,type:'',frequency:'',AC:'',blessing:'',classe:'',contest_effect:'',contest_type:'',damage_base:'',effect:'',extra_lines:[],range:'',roll:'',special_effect:''}}));
                                                }
                                            }
                                        }
                                        value = "";
                                    }}>

                                </Select>

                            </div>
                        }

                        <div>
                            <h2>Egg Moves :</h2>
                            <p> (You can lock egg moves so they are forced to appear in the final sheet table)</p>
                            <Table responsive style={{borderColor:'white',borderWidth:'1px',borderStyle:'solid',minWidth:'70%',maxWidth:'70%'}}>
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Freq</th>
                                    <th>AC</th>
                                    <th>Type</th>
                                    <th>Roll</th>
                                    <th>Dmg Type</th>
                                    <th>Range</th>
                                    <th>Effect</th>
                                    <th></th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                {egg_moves.map(egg => {
                                    const final_roll = (egg["roll"].includes("/")?egg["roll"].split("/")[0]:egg["roll"]);

                                    return <tr style={{color:(egg && locked_egg_moves.findIndex(obj => obj === egg["move"]) > -1?'green':'')}}>
                                        <th>{egg["move"]}</th>
                                        <th>{egg["frequency"]}</th>
                                        <th>{egg["AC"]}</th>
                                        <th>{egg["type"]}</th>
                                        <th>{final_roll}</th>
                                        <th>{egg["classe"]}</th>
                                        <th>{egg["range"]}</th>
                                        <th>{egg["effect"]}</th>
                                        {   locked_egg_moves.findIndex(obj => obj === egg["move"]) > -1 ?
                                            <th><Button disabled={false} style={{marginLeft:'5px',marginTop:'5px',height:'30px'}} onClick={() => {
                                                let index_to_remove = locked_egg_moves.findIndex(move_c => move_c === egg["move"]);
                                                if (index_to_remove > -1) {
                                                    dispatch(removeMovePokemonLockedEggMoves({pokemon_locked_egg_moves:index_to_remove}));
                                                }
                                            }}> Unlock </Button></th>
                                            :
                                            <th><Button disabled={chosen_moves.length + locked_egg_moves.length >= 9} style={{marginLeft:'5px',marginTop:'5px',height:'30px'}} onClick={() => {
                                                if (egg["move"] !== "") {
                                                    let index_to_remove = locked_egg_moves.findIndex(move_c => move_c === egg["move"]);
                                                    if (index_to_remove === -1) {
                                                        dispatch(addMovePokemonLockedEggMoves({pokemon_locked_egg_moves: egg["move"]}));
                                                    }
                                                }
                                            }}> Lock </Button></th>
                                        }
                                        <th><Button disabled={level===-1} style={{marginLeft:'5px',marginTop:'5px',height:'30px'}} onClick={() => {
                                            let index_to_remove = egg_moves.findIndex(move_c => move_c["move"] === egg["move"]);
                                            if (index_to_remove > -1) {
                                                dispatch(removeMovePokemonEggMoves({pokemon_chosen_egg_moves:index_to_remove}));
                                            }
                                            let index_to_remove_lock = locked_egg_moves.findIndex(move_c => move_c["move"] === egg["move"]);
                                            if (index_to_remove_lock > -1) {
                                                dispatch(removeMovePokemonLockedEggMoves({pokemon_locked_egg_moves:index_to_remove_lock}));
                                            }
                                        }}> remove </Button></th>
                                    </tr>
                                })}
                                </tbody>
                            </Table><br></br>
                            <Button disabled={locked_egg_moves.length === 0} style={{marginLeft:'60%',marginTop:'5px',height:'30px'}} onClick={() => {
                                for (let i = 0; i < locked_egg_moves.length; i++) {
                                    dispatch(removeMovePokemonLockedEggMoves({pokemon_locked_egg_moves:i}));
                                }
                            }}> Unlock all </Button>
                        </div>

                        Add Egg moves : <Select
                        showSearch
                        style={{width:'30%',height:'30px'}}
                        defaultValue={""}
                        options={
                            final_egg_moves.map((m) =>
                                { return {"value":m["move"].replace(':','').trim(),"label":m["move"]} }
                            )}
                        onChange={(value) => {
                            let move_name = value.replace(':','').trim();
                            let index_to_remove = egg_moves.findIndex(move_c => move_c["move"] === move_name);
                            if (index_to_remove > -1) {
                                dispatch(removeMovePokemonEggMoves({pokemon_chosen_egg_moves:index_to_remove}));
                            }
                            else {
                                let moves_to_add = moves.find((m) => m["move"] === move_name);
                                if (moves_to_add) {
                                    dispatch(addMovePokemonEggMoves({pokemon_chosen_egg_moves: moves_to_add}));

                                }
                            }


                            value = "";
                        }}>

                    </Select>
                        <br></br>
                        <br></br>
                        <div>
                            <h2>TM Moves :</h2>
                            <p> (You can lock tm moves so they are forced to appear in the final sheet table)</p>
                            <Table responsive style={{borderColor:'white',borderWidth:'1px',borderStyle:'solid',minWidth:'70%',maxWidth:'70%'}}>
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Freq</th>
                                    <th>AC</th>
                                    <th>Type</th>
                                    <th>Roll</th>
                                    <th>Dmg Type</th>
                                    <th>Range</th>
                                    <th>Effect</th>
                                    <th></th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                {tmhm_moves.map(egg => {
                                    const final_roll = (egg["roll"].includes("/")?egg["roll"].split("/")[0]:egg["roll"]);
                                    return <tr style={{color:(egg && locked_egg_moves.findIndex(obj => obj === egg["move"]) > -1?'green':'')}}>
                                        <th>{egg["move"]}</th>
                                        <th>{egg["frequency"]}</th>
                                        <th>{egg["AC"]}</th>
                                        <th>{egg["type"]}</th>
                                        <th>{final_roll}</th>
                                        <th>{egg["classe"]}</th>
                                        <th>{egg["range"]}</th>
                                        <th>{egg["effect"]}</th>
                                        {   locked_egg_moves.findIndex(obj => obj === egg["move"]) > -1 ?
                                            <th><Button disabled={false} style={{marginLeft:'5px',marginTop:'5px',height:'30px'}} onClick={() => {
                                                let index_to_remove = locked_egg_moves.findIndex(move_c => move_c === egg["move"]);
                                                if (index_to_remove > -1) {
                                                    dispatch(removeMovePokemonLockedEggMoves({pokemon_locked_egg_moves:index_to_remove}));
                                                }
                                            }}> Unlock </Button></th>
                                            :
                                            <th><Button disabled={chosen_moves.length + locked_egg_moves.length >= 9} style={{marginLeft:'5px',marginTop:'5px',height:'30px'}} onClick={() => {
                                                if (egg["move"] !== "") {
                                                    let index_to_remove = locked_egg_moves.findIndex(move_c => move_c === egg["move"]);
                                                    if (index_to_remove === -1) {
                                                        dispatch(addMovePokemonLockedEggMoves({pokemon_locked_egg_moves: egg["move"]}));
                                                    }
                                                }
                                            }}> Lock </Button></th>
                                        }
                                        <th><Button disabled={level===-1} style={{marginLeft:'5px',marginTop:'5px',height:'30px'}} onClick={() => {
                                            let index_to_remove = egg_moves.findIndex(move_c => move_c["move"] === egg["move"]);
                                            if (index_to_remove > -1) {
                                                dispatch(removeMovePokemonTMHMMoves({pokemon_chosen_tmhm_moves:index_to_remove}));
                                            }
                                            let index_to_remove_lock = locked_egg_moves.findIndex(move_c => move_c["move"] === egg["move"]);
                                            if (index_to_remove_lock > -1) {
                                                dispatch(removeMovePokemonLockedEggMoves({pokemon_locked_egg_moves:index_to_remove_lock}));
                                            }
                                        }}> remove </Button></th>
                                    </tr>
                                })}
                                </tbody>
                            </Table><br></br>
                            <Button disabled={locked_egg_moves.length === 0} style={{marginLeft:'60%',marginTop:'5px',height:'30px'}} onClick={() => {
                                for (let i = 0; i < locked_egg_moves.length; i++) {
                                    dispatch(removeMovePokemonLockedEggMoves({pokemon_locked_egg_moves:i}));
                                }
                            }}> Unlock all </Button>
                        </div>

                        Add TM moves : <Select
                        showSearch
                        style={{width:'30%',height:'30px'}}
                        defaultValue={""}
                        options={
                            final_tm_moves.map((m) =>
                                { return {"value":m["move"].replace(':','').trim(),"label":m["move"]} }
                            )}
                        onChange={(value) => {
                            let move_name = value.replace(':','').trim();
                            let index_to_remove = egg_moves.findIndex(move_c => move_c["move"] === move_name);
                            if (index_to_remove > -1) {
                                dispatch(removeMovePokemonTMHMMoves({pokemon_chosen_tmhm_moves:index_to_remove}));
                            }
                            else {
                                let moves_to_add = moves.find((m) => m["move"] === move_name);
                                if (moves_to_add) {
                                    dispatch(addMovePokemonTMHMMoves({pokemon_chosen_tmhm_moves: moves_to_add}));

                                }
                            }


                            value = "";
                        }}>

                    </Select>
                        <br></br>
                        <br></br>
                        <br></br>
                        <div>
                            <Button disabled={!ready_to_generate} style={{marginLeft:'5px',width:'15%',height:'50px'}} onClick={() => {
                                console.log(egg_moves);
                                console.log(locked_egg_moves);
                                console.log(chosen_moves);
                                let final =`![](${"http://faeresdev.site"+local_png_img})\n`;
                                final += `# ${choosen_pokemon.charAt(0).toUpperCase() + choosen_pokemon.slice(1)}`;
                                final += `\n`
                                final += `Card: ${card}\n`
                                final += `Gender: ${gender}\n`
                                final += `Item: \n`
                                final += `Nature: ${NATURE_MATRIX[final_buffed_stat][final_lowered_stat]}\n`
                                final += `Level: ${level}\n`
                                final += `Type: ${pokemon_obj["pokemon_types"]}\n`
                                final += `Rarity: ${rarity}\n`
                                final += `Weight: ${pokemon_obj["weight"]}\n`
                                final += `Height: ${pokemon_obj["height"]}\n`
                                final += `\n`
                                final += `## **Abilities**\n`
                                final += `\n`
                                final += `| **Ability** | **Effect** |\n`
                                final += `| ---------------- | ------------------ |\n`
                                if (base_ability !== "") {
                                    const found_ability = abilities.find(ability => ability["name"] === base_ability);
                                    if (found_ability) {
                                        final += `| ${found_ability["name"]} |  ${found_ability["effect"]} | \n`
                                    }
                                }

                                if (advanced_ability !== "") {
                                    const found_ability = abilities.find(ability => ability["name"] === advanced_ability);
                                    if (found_ability) {
                                        final += `| ${found_ability["name"]} |  ${found_ability["effect"]}} | \n`
                                    }
                                }

                                if (high_ability !== "") {
                                    const found_ability = abilities.find(ability => ability["name"] === high_ability);
                                    if (found_ability) {
                                        final += `| ${found_ability["name"]} |  ${found_ability["effect"]}} | \n`
                                    }
                                }
                                final += `\n`
                                final += `\n`
                                final += `## **Capabilities**\n`
                                final += `\n`
                                final += `| **Capability** | **Value** |\n`
                                final += `| ---------------- | ------------------ |\n`
                                pokemon_obj["capabilities"].map(cat => {
                                    if (cat["name"] !== ""){
                                        final += `| ${cat['name']} | ${cat['value']} | \n`
                                    }
                                })
                                final += `\n`
                                final += `\n`
                                final += `## **Skills**\n`
                                final += `\n`
                                final += `| **Skill** | **Roll** |\n`
                                final += `| ---------------- | ------------------ |\n`
                                pokemon_obj["skills"].map(cat => {
                                    if (cat["name"] !== ""){
                                        final += `| ${cat['name']} | ${cat['roll']} | \n`
                                    }
                                })
                                final += `\n`
                                final += `\n`
                                final += `## **Stats**\n`
                                final += `\n`
                                const hit_points = level+(3*final_hp)+10
                                final += `| **Hit Points Max :${hit_points}**                           | **Hit Points: ${hit_points}/${hit_points}** |\n`
                                final += `|-------------------------------------------------------------|---------------------------------------------|\n`
                                final += `| **Max HP**: ${pokemon_obj["stat_hp"]}+${hp_auto_buff}+${points_by_stats["HP"]}=${final_hp}              | **Current HP**:${final_hp}                 |\n`.replace("+-","-")
                                final += `| **Max ATK**: ${pokemon_obj["stat_atk"]}+${atk_auto_buff}+${points_by_stats["ATK"]}=${final_atk}              | **Current ATK**:${final_atk}                 |\n`.replace("+-","-")
                                final += `| **Max DEF**: ${pokemon_obj["stat_def"]}+${def_auto_buff}+${points_by_stats["DEF"]}=${final_def}              | **Current DEF**:${final_def}                 |\n`.replace("+-","-")
                                final += `| **Max SPATK**: ${pokemon_obj["stat_sp_atk"]}+${spatk_auto_buff}+${points_by_stats["SPATK"]}=${final_spatk}              | **Current SPATK**:${final_spatk}                 |\n`.replace("+-","-")
                                final += `| **Max SPDEF**: ${pokemon_obj["stat_sp_def"]}+${spdef_auto_buff}+${points_by_stats["SPDEF"]}=${final_spdef}              | **Current SPDEF**:${final_spdef}                 |\n`.replace("+-","-")
                                final += `| **Max SPEED**: ${pokemon_obj["stat_spd"]}+${spd_auto_buff}+${points_by_stats["SPD"]}=${final_speed}              | **Current SPEED**:${final_speed}                 |\n`.replace("+-","-")
                                final += `\n`
                                const phy_evade = Math.round(final_def/10)
                                const spe_evade = Math.round(final_spdef/10)
                                const speed_evade = Math.round(final_speed/10)
                                const injuries = 0;
                                let added_moves = 0;
                                let local_chosen_moves = chosen_moves.map(x => x);
                                let local_egg_moves = egg_moves.map(x => x); // deep copy
                                let local_tmhm_moves = tmhm_moves.map(x => x); // deep copy
                                let local_locked_egg_moves = locked_egg_moves.map(x => x);// deep copy
                                let egg_move_array = [];
                                let normal_array = [];
                                final += `| **Derived stats** |                |\n`
                                final += `|-------------------|----------------|\n`
                                final += `| Phys Evade        | ${phy_evade}    |\n`
                                final += `| Spec Evade        | ${spe_evade}    |\n`
                                final += `| Speed Evade       | ${speed_evade}  |\n`
                                final += `| Injuries          | ${injuries}     |\n`
                                final += `\n`
                                final += `*Pokémon Hit Points = Pokémon Level + (HP x3) + 10*\n`
                                final += `\n`
                                final += `## **Moves** :\n`
                                final += `\n`
                                final += `| **Move**    | **Freq**         | **AC**    | **Type**    | **Roll**    | **Dmg. Type**      | **Range**    | **Special Effect** |\n`
                                final += `|-------------|------------------|-----------|-------------|-------------|--------------------|--------------|-------------------|\n`


                                while (added_moves < 3 && local_locked_egg_moves.length > 0) {
                                    const lock_egg_move_name = local_locked_egg_moves.pop();
                                    if (lock_egg_move_name) {
                                        const index_egg_move = local_egg_moves.findIndex(obj=> obj["move"] === lock_egg_move_name);
                                        if (index_egg_move > -1) {
                                            egg_move_array.push(`| ${local_egg_moves[index_egg_move]['move']} | ${local_egg_moves[index_egg_move]['frequency']} | ${local_egg_moves[index_egg_move]['AC']} | ${local_egg_moves[index_egg_move]['type']} | ${local_egg_moves[index_egg_move]['roll']} | ${local_egg_moves[index_egg_move]['classe']} | ${local_egg_moves[index_egg_move]['range']} | ${local_egg_moves[index_egg_move]['effect']}     |\n`)
                                            local_egg_moves.splice(index_egg_move,1)
                                            added_moves += 1;
                                        }
                                        else {
                                            const index_egg_move = local_tmhm_moves.findIndex(obj=> obj["move"] === lock_egg_move_name);
                                            if (index_egg_move > -1) {
                                                egg_move_array.push(`| ${local_tmhm_moves[index_egg_move]['move']} | ${local_tmhm_moves[index_egg_move]['frequency']} | ${local_tmhm_moves[index_egg_move]['AC']} | ${local_tmhm_moves[index_egg_move]['type']} | ${local_tmhm_moves[index_egg_move]['roll']} | ${local_tmhm_moves[index_egg_move]['classe']} | ${local_tmhm_moves[index_egg_move]['range']} | ${local_tmhm_moves[index_egg_move]['effect']}     |\n`)
                                                local_tmhm_moves.splice(index_egg_move,1)
                                                added_moves += 1;
                                            }
                                        }

                                    }
                                }


                                while (added_moves < 3 && local_egg_moves.length > 0) {
                                    const egg_move_l = local_egg_moves.pop();
                                    if (egg_move_l) {
                                        const final_roll = (egg_move_l['roll'].includes("/")?egg_move_l['roll'].split("/")[0]:egg_move_l['roll']);
                                        egg_move_array.push(`| ${egg_move_l['move']} | ${egg_move_l['frequency']} | ${egg_move_l['AC']} | ${egg_move_l['type']} | ${final_roll} | ${egg_move_l['classe']} | ${egg_move_l['range']} | ${egg_move_l['effect']}     |\n`)
                                        added_moves += 1;
                                    }
                                }
                                while (added_moves < 3 && local_tmhm_moves.length > 0) {
                                    const egg_move_l = local_tmhm_moves.pop();
                                    if (egg_move_l) {
                                        const final_roll = (egg_move_l['roll'].includes("/")?egg_move_l['roll'].split("/")[0]:egg_move_l['roll']);
                                        egg_move_array.push(`| ${egg_move_l['move']} | ${egg_move_l['frequency']} | ${egg_move_l['AC']} | ${egg_move_l['type']} | ${final_roll} | ${egg_move_l['classe']} | ${egg_move_l['range']} | ${egg_move_l['effect']}     |\n`)
                                        added_moves += 1;
                                    }
                                }



                                while (added_moves < 3){
                                    egg_move_array.push(`|               |   |   |   |   |   |   |   |\n`)
                                    added_moves += 1;
                                }



                                while (added_moves < 9 && local_locked_egg_moves.length > 0) {
                                    const lock_egg_move_name = local_locked_egg_moves.pop();
                                    console.log(lock_egg_move_name);
                                    if (lock_egg_move_name) {
                                        const index_egg_move = local_egg_moves.findIndex(obj=> obj["move"] === lock_egg_move_name);
                                        if (index_egg_move > -1) {
                                            const final_roll = (local_egg_moves['roll'].includes("/")?local_egg_moves['roll'].split("/")[0]:local_egg_moves['roll']);
                                            normal_array.push(`| ${local_egg_moves[index_egg_move]['move']} | ${local_egg_moves[index_egg_move]['frequency']} | ${local_egg_moves[index_egg_move]['AC']} | ${local_egg_moves[index_egg_move]['type']} | ${final_roll} | ${local_egg_moves[index_egg_move]['classe']} | ${local_egg_moves[index_egg_move]['range']} | ${local_egg_moves[index_egg_move]['effect']}     |\n`)
                                            local_egg_moves.splice(index_egg_move,1)
                                            added_moves += 1;
                                        }
                                        else {
                                            const index_egg_move = local_tmhm_moves.findIndex(obj=> obj["move"] === lock_egg_move_name);
                                            if (index_egg_move > -1) {
                                                const final_roll = (local_tmhm_moves['roll'].includes("/")?local_tmhm_moves['roll'].split("/")[0]:local_tmhm_moves['roll']);
                                                normal_array.push(`| ${local_tmhm_moves[index_egg_move]['move']} | ${local_tmhm_moves[index_egg_move]['frequency']} | ${local_tmhm_moves[index_egg_move]['AC']} | ${local_tmhm_moves[index_egg_move]['type']} | ${final_roll} | ${local_tmhm_moves[index_egg_move]['classe']} | ${local_tmhm_moves[index_egg_move]['range']} | ${local_tmhm_moves[index_egg_move]['effect']}     |\n`)
                                                local_tmhm_moves.splice(index_egg_move,1)
                                                added_moves += 1;
                                            }
                                        }

                                    }
                                }


                                while (added_moves < 9 && local_chosen_moves.length > 0) {
                                    const egg_move_l = local_chosen_moves.pop();
                                    if (egg_move_l) {
                                        const final_roll = (egg_move_l['roll'].includes("/")?egg_move_l['roll'].split("/")[0]:egg_move_l['roll']);
                                        normal_array.push(`| ${egg_move_l['move']} | ${egg_move_l['frequency']} | ${egg_move_l['AC']} | ${egg_move_l['type']} | ${final_roll} | ${egg_move_l['classe']} | ${egg_move_l['range']} | ${egg_move_l['effect']}     |\n`)
                                        added_moves += 1;
                                    }
                                }

                                while (added_moves < 9 && local_egg_moves.length > 0) {
                                    const egg_move_l = local_egg_moves.pop();
                                    if (egg_move_l) {
                                        const final_roll = (egg_move_l['roll'].includes("/")?egg_move_l['roll'].split("/")[0]:egg_move_l['roll']);
                                        normal_array.push(`| ${egg_move_l['move']} | ${egg_move_l['frequency']} | ${egg_move_l['AC']} | ${egg_move_l['type']} | ${final_roll} | ${egg_move_l['classe']} | ${egg_move_l['range']} | ${egg_move_l['effect']}     |\n`)
                                        added_moves += 1;
                                    }
                                }

                                while (added_moves < 9 && local_tmhm_moves.length > 0) {
                                    const egg_move_l = local_tmhm_moves.pop();
                                    if (egg_move_l) {
                                        const final_roll = (egg_move_l['roll'].includes("/")?egg_move_l['roll'].split("/")[0]:egg_move_l['roll']);
                                        normal_array.push(`| ${egg_move_l['move']} | ${egg_move_l['frequency']} | ${egg_move_l['AC']} | ${egg_move_l['type']} | ${final_roll} | ${egg_move_l['classe']} | ${egg_move_l['range']} | ${egg_move_l['effect']}     |\n`)
                                        added_moves += 1;
                                    }
                                }





                                while (added_moves < 9){
                                    normal_array.push(`|               |   |   |   |   |   |   |   |\n`)
                                    added_moves += 1;
                                }

                                normal_array.push(`\n`)
                                normal_array.push(`|               |   |   |   |   |   |   |   |\n`)
                                normal_array.push(`|---------------|---|---|---|---|---|---|---|\n`)

                                normal_array.forEach((item, i) => {
                                    final += item;
                                })

                                egg_move_array.forEach((item, i) => {
                                    final += item;
                                })

                                final += `\n`
                                const tutor_point = Math.floor(level/5)
                                final += `Tutor points = ${tutor_point}\n`
                                final += `\n`
                                final += `\n`
                                final += `## **Notes**\n`
                                final += `\n`
                                final += `egg moves : `
                                if (egg_moves.length === 0) {
                                    final += `None`
                                }
                                else {
                                    egg_moves.forEach(egg_move => {
                                        final += `${egg_move["move"]},`
                                    })
                                    final = final.substring(0,final.length-1);
                                }

                                final += `\n`
                                final += `TM moves : `
                                if (tmhm_moves.length === 0) {
                                    final += `None`
                                }
                                else {
                                    tmhm_moves.forEach(egg_move => {
                                        final += `${egg_move["move"]},`
                                    })
                                    final = final.substring(0,final.length-1);
                                }

                                console.log(final)
                                var blob = new Blob([final], { type: 'text/plain' });
                                download(blob, pokemon_obj["name"]+".md", "text/plain");
                            }}> Generate Markdown </Button>
                            <Button disabled={!ready_to_generate} style={{marginTop:'5px',marginLeft:'5px',display:'grid',width:'15%',height:'50px'}} onClick={() => {
                                const container = document.createElement("div");

                                container.innerHTML += `<img src="${"http://faeresdev.site"+local_png_img}" width="200">`;
                                container.innerHTML += `<h1>${choosen_pokemon.charAt(0).toUpperCase() + choosen_pokemon.slice(1)}</h1>`;

                                container.innerHTML += `
                    <p>
                    Card: ${card}<br>
                    Gender: ${gender}<br>
                    Item:<br>
                    Nature: ${NATURE_MATRIX[final_buffed_stat][final_lowered_stat]}<br>
                    Level: ${level}<br>
                    Type: ${pokemon_obj["pokemon_types"]}<br>
                    Rarity: ${rarity}<br>
                    Weight: ${pokemon_obj["weight"]}<br>
                    Height: ${pokemon_obj["height"]}
                    </p>
                    `;

                                container.innerHTML += `<h2>Abilities</h2>`;

                                let abilityTable = `<table border="1" style="border-collapse:collapse">
                    <tr><th>Ability</th><th>Effect</th></tr>`;

                                if (base_ability !== "") {
                                    const a = abilities.find(x => x.name === base_ability);
                                    if (a) abilityTable += `<tr><td>${a.name}</td><td>${a.effect}</td></tr>`;
                                }

                                if (advanced_ability !== "") {
                                    const a = abilities.find(x => x.name === advanced_ability);
                                    if (a) abilityTable += `<tr><td>${a.name}</td><td>${a.effect}</td></tr>`;
                                }

                                if (high_ability !== "") {
                                    const a = abilities.find(x => x.name === high_ability);
                                    if (a) abilityTable += `<tr><td>${a.name}</td><td>${a.effect}</td></tr>`;
                                }

                                abilityTable += `</table>`;
                                container.innerHTML += abilityTable;


                                container.innerHTML += `<h2>Capabilities</h2>`;

                                let capTable = `<table border="1" style="border-collapse:collapse">
                    <tr><th>Capability</th><th>Value</th></tr>`;

                                pokemon_obj.capabilities.forEach(cat=>{
                                    if(cat.name!==""){
                                        capTable += `<tr><td>${cat.name}</td><td>${cat.value}</td></tr>`;
                                    }
                                });

                                capTable += `</table>`;
                                container.innerHTML += capTable;


                                container.innerHTML += `<h2>Skills</h2>`;

                                let skillTable = `<table border="1" style="border-collapse:collapse">
                    <tr><th>Skill</th><th>Roll</th></tr>`;

                                pokemon_obj.skills.forEach(skill=>{
                                    if(skill.name!==""){
                                        skillTable += `<tr><td>${skill.name}</td><td>${skill.roll}</td></tr>`;
                                    }
                                });

                                skillTable += `</table>`;
                                container.innerHTML += skillTable;


                                const hit_points = level + (3 * final_hp) + 10;

                                container.innerHTML += `<h2>Stats</h2>`;

                                let statsTable = `
                        <table border="1" style="border-collapse:collapse">
                        <tr>
                        <td><b>Hit Points Max: ${hit_points}</b></td>
                        <td><b>Hit Points: ${hit_points}/${hit_points}</b></td>
                        </tr>
                        
                        <tr>
                        <td><b>Max HP</b>: ${pokemon_obj["stat_hp"]}+${hp_auto_buff}+${points_by_stats["HP"]}=${final_hp}</td>
                        <td><b>Current HP</b>: ${final_hp}</td>
                        </tr>
                        
                        <tr>
                        <td><b>Max ATK</b>: ${pokemon_obj["stat_atk"]}+${atk_auto_buff}+${points_by_stats["ATK"]}=${final_atk}</td>
                        <td><b>Current ATK</b>: ${final_atk}</td>
                        </tr>
                        
                        <tr>
                        <td><b>Max DEF</b>: ${pokemon_obj["stat_def"]}+${def_auto_buff}+${points_by_stats["DEF"]}=${final_def}</td>
                        <td><b>Current DEF</b>: ${final_def}</td>
                        </tr>
                        
                        <tr>
                        <td><b>Max SPATK</b>: ${pokemon_obj["stat_sp_atk"]}+${spatk_auto_buff}+${points_by_stats["SPATK"]}=${final_spatk}</td>
                        <td><b>Current SPATK</b>: ${final_spatk}</td>
                        </tr>
                        
                        <tr>
                        <td><b>Max SPDEF</b>: ${pokemon_obj["stat_sp_def"]}+${spdef_auto_buff}+${points_by_stats["SPDEF"]}=${final_spdef}</td>
                        <td><b>Current SPDEF</b>: ${final_spdef}</td>
                        </tr>
                        
                        <tr>
                        <td><b>Max SPEED</b>: ${pokemon_obj["stat_spd"]}+${spd_auto_buff}+${points_by_stats["SPD"]}=${final_speed}</td>
                        <td><b>Current SPEED</b>: ${final_speed}</td>
                        </tr>
                        </table>
                        `;

                                container.innerHTML += statsTable;


                                const phy_evade = Math.round(final_def/10);
                                const spe_evade = Math.round(final_spdef/10);
                                const speed_evade = Math.round(final_speed/10);

                                container.innerHTML += `
                        <h3>Derived Stats</h3>
                        <table border="1" style="border-collapse:collapse">
                        <tr><td>Phys Evade</td><td>${phy_evade}</td></tr>
                        <tr><td>Spec Evade</td><td>${spe_evade}</td></tr>
                        <tr><td>Speed Evade</td><td>${speed_evade}</td></tr>
                        <tr><td>Injuries</td><td>0</td></tr>
                        </table>
                        `;


                                container.innerHTML += `<h2>Moves</h2>`;
                                let added_moves = 0;
                                let local_chosen_moves = chosen_moves.map(x => x);
                                let local_egg_moves = egg_moves.map(x => x); // deep copy
                                let local_tmhm_moves = tmhm_moves.map(x => x); // deep copy
                                let local_locked_egg_moves = locked_egg_moves.map(x => x);// deep copy
                                let egg_move_array = [];
                                let normal_array = [];

                                egg_move_array.push(`
                        <table border="1" style="border-collapse:collapse">
                        <tr>
                        <th>Move</th>
                        <th>Freq</th>
                        <th>AC</th>
                        <th>Type</th>
                        <th>Roll</th>
                        <th>Dmg Type</th>
                        <th>Range</th>
                        <th>Special Effect</th>
                        </tr>
                        `);

                                while (added_moves < 3 && local_locked_egg_moves.length > 0) {
                                    const lock_egg_move_name = local_locked_egg_moves.pop();
                                    if (lock_egg_move_name) {
                                        const index_egg_move = local_egg_moves.findIndex(obj=> obj["move"] === lock_egg_move_name);
                                        if (index_egg_move > -1) {
                                            const final_roll = (local_egg_moves[index_egg_move]['roll'].includes("/")?local_egg_moves[index_egg_move]['roll'].split("/")[0]:local_egg_moves[index_egg_move]['roll']);
                                            egg_move_array.push(`
                                <tr>
                                <td>${local_egg_moves[index_egg_move]['move']}</td>
                                <td>${local_egg_moves[index_egg_move]['frequency']}</td>
                                <td>${local_egg_moves[index_egg_move]['AC']}</td>
                                <td>${local_egg_moves[index_egg_move]['type']}</td>
                                <td>${final_roll}</td>
                                <td>${local_egg_moves[index_egg_move]['classe']}</td>
                                <td>${local_egg_moves[index_egg_move]['range']}</td>
                                <td>${local_egg_moves[index_egg_move]['effect']}</td>
                                </tr>`);                                local_egg_moves.splice(index_egg_move,1)
                                            added_moves += 1;
                                        }
                                        else {
                                            const index_egg_move = local_tmhm_moves.findIndex(obj=> obj["move"] === lock_egg_move_name);
                                            if (index_egg_move > -1) {
                                                const final_roll = (local_tmhm_moves[index_egg_move]['roll'].includes("/")?local_tmhm_moves[index_egg_move]['roll'].split("/")[0]:local_tmhm_moves[index_egg_move]['roll']);
                                                egg_move_array.push(`
                                <tr>
                                <td>${local_tmhm_moves[index_egg_move]['move']}</td>
                                <td>${local_tmhm_moves[index_egg_move]['frequency']}</td>
                                <td>${local_tmhm_moves[index_egg_move]['AC']}</td>
                                <td>${local_tmhm_moves[index_egg_move]['type']}</td>
                                <td>${final_roll}</td>
                                <td>${local_tmhm_moves[index_egg_move]['classe']}</td>
                                <td>${local_tmhm_moves[index_egg_move]['range']}</td>
                                <td>${local_tmhm_moves[index_egg_move]['effect']}</td>
                                </tr>`);                                    local_tmhm_moves.splice(index_egg_move,1)
                                                added_moves += 1;
                                            }
                                        }

                                    }
                                }



                                while (added_moves < 3 && local_egg_moves.length > 0) {
                                    const egg_move_l = local_egg_moves.pop();
                                    if (egg_move_l) {
                                        const final_roll = (egg_move_l['roll'].includes("/")?egg_move_l['roll'].split("/")[0]:egg_move_l['roll']);

                                        egg_move_array.push(`
                                <tr>
                                <td>${egg_move_l['move']}</td>
                                <td>${egg_move_l['frequency']}</td>
                                <td>${egg_move_l['AC']}</td>
                                <td>${egg_move_l['type']}</td>
                                <td>${final_roll}</td>
                                <td>${egg_move_l['classe']}</td>
                                <td>${egg_move_l['range']}</td>
                                <td>${egg_move_l['effect']}</td>
                                </tr>`);                            added_moves += 1;
                                    }
                                }
                                while (added_moves < 3 && local_tmhm_moves.length > 0) {
                                    const egg_move_l = local_tmhm_moves.pop();
                                    if (egg_move_l) {
                                        const final_roll = (egg_move_l['roll'].includes("/")?egg_move_l['roll'].split("/")[0]:egg_move_l['roll']);
                                        egg_move_array.push(`
                                <tr>
                                <td>${egg_move_l['move']}</td>
                                <td>${egg_move_l['frequency']}</td>
                                <td>${egg_move_l['AC']}</td>
                                <td>${egg_move_l['type']}</td>
                                <td>${final_roll}</td>
                                <td>${egg_move_l['classe']}</td>
                                <td>${egg_move_l['range']}</td>
                                <td>${egg_move_l['effect']}</td>
                                </tr>`);                            added_moves += 1;
                                    }
                                }
                                while (added_moves < 3){
                                    egg_move_array.push(`<tr>${"<td></td>".repeat(8)}</tr>`);
                                    added_moves++;
                                }
                                egg_move_array.push(`</table>`);
                                // container.innerHTML += moveTable;

                                normal_array.push(`
                        <table border="1" style="border-collapse:collapse">
                        <tr>
                        <th>Move</th>
                        <th>Freq</th>
                        <th>AC</th>
                        <th>Type</th>
                        <th>Roll</th>
                        <th>Dmg Type</th>
                        <th>Range</th>
                        <th>Special Effect</th>
                        </tr>
                        `);

                                /* -------- EGG MOVES TABLE -------- */


                                while (added_moves < 9 && local_locked_egg_moves.length > 0) {
                                    const lock_egg_move_name = local_locked_egg_moves.pop();
                                    console.log(lock_egg_move_name);
                                    if (lock_egg_move_name) {
                                        const index_egg_move = local_egg_moves.findIndex(obj=> obj["move"] === lock_egg_move_name);
                                        if (index_egg_move > -1) {
                                            const final_roll = (local_egg_moves[index_egg_move]['roll'].includes("/")?local_egg_moves[index_egg_move]['roll'].split("/")[0]:local_egg_moves[index_egg_move]['roll']);
                                            normal_array.push(`
                                <tr>
                                <td>${local_egg_moves[index_egg_move]['move']}</td>
                                <td>${local_egg_moves[index_egg_move]['frequency']}</td>
                                <td>${local_egg_moves[index_egg_move]['AC']}</td>
                                <td>${local_egg_moves[index_egg_move]['type']}</td>
                                <td>${final_roll}</td>
                                <td>${local_egg_moves[index_egg_move]['classe']}</td>
                                <td>${local_egg_moves[index_egg_move]['range']}</td>
                                <td>${local_egg_moves[index_egg_move]['effect']}</td>
                                </tr>`);                                local_egg_moves.splice(index_egg_move,1)
                                            added_moves += 1;
                                        }
                                        else {
                                            const index_egg_move = local_tmhm_moves.findIndex(obj=> obj["move"] === lock_egg_move_name);
                                            if (index_egg_move > -1) {
                                                const final_roll = (local_tmhm_moves[index_egg_move]['roll'].includes("/")?local_tmhm_moves[index_egg_move]['roll'].split("/")[0]:local_tmhm_moves[index_egg_move]['roll']);

                                                normal_array.push(`
                                <tr>
                                <td>${local_tmhm_moves[index_egg_move]['move']}</td>
                                <td>${local_tmhm_moves[index_egg_move]['frequency']}</td>
                                <td>${local_tmhm_moves[index_egg_move]['AC']}</td>
                                <td>${local_tmhm_moves[index_egg_move]['type']}</td>
                                <td>${final_roll}</td>
                                <td>${local_tmhm_moves[index_egg_move]['classe']}</td>
                                <td>${local_tmhm_moves[index_egg_move]['range']}</td>
                                <td>${local_tmhm_moves[index_egg_move]['effect']}</td>
                                </tr>`);                                    local_tmhm_moves.splice(index_egg_move,1)
                                                added_moves += 1;
                                            }
                                        }

                                    }
                                }


                                while (added_moves < 9 && local_chosen_moves.length > 0) {
                                    const egg_move_l = local_chosen_moves.pop();
                                    if (egg_move_l) {
                                        const final_roll = (egg_move_l['roll'].includes("/")?egg_move_l['roll'].split("/")[0]:egg_move_l['roll']);

                                        normal_array.push(`
                                <tr>
                                <td>${egg_move_l['move']}</td>
                                <td>${egg_move_l['frequency']}</td>
                                <td>${egg_move_l['AC']}</td>
                                <td>${egg_move_l['type']}</td>
                                <td>${final_roll}</td>
                                <td>${egg_move_l['classe']}</td>
                                <td>${egg_move_l['range']}</td>
                                <td>${egg_move_l['effect']}</td>
                                </tr>`);                            added_moves += 1;
                                    }
                                }

                                while (added_moves < 9 && local_egg_moves.length > 0) {
                                    const egg_move_l = local_egg_moves.pop();
                                    if (egg_move_l) {
                                        const final_roll = (egg_move_l['roll'].includes("/")?egg_move_l['roll'].split("/")[0]:egg_move_l['roll']);

                                        normal_array.push(`
                                <tr>
                                <td>${egg_move_l['move']}</td>
                                <td>${egg_move_l['frequency']}</td>
                                <td>${egg_move_l['AC']}</td>
                                <td>${egg_move_l['type']}</td>
                                <td>${final_roll}</td>
                                <td>${egg_move_l['classe']}</td>
                                <td>${egg_move_l['range']}</td>
                                <td>${egg_move_l['effect']}</td>
                                </tr>`);                             added_moves += 1;
                                    }
                                }

                                while (added_moves < 9 && local_tmhm_moves.length > 0) {
                                    const egg_move_l = local_tmhm_moves.pop();
                                    if (egg_move_l) {
                                        const final_roll = (egg_move_l['roll'].includes("/")?egg_move_l['roll'].split("/")[0]:egg_move_l['roll']);

                                        normal_array.push(`
                                <tr>
                                <td>${egg_move_l['move']}</td>
                                <td>${egg_move_l['frequency']}</td>
                                <td>${egg_move_l['AC']}</td>
                                <td>${egg_move_l['type']}</td>
                                <td>${final_roll}</td>
                                <td>${egg_move_l['classe']}</td>
                                <td>${egg_move_l['range']}</td>
                                <td>${egg_move_l['effect']}</td>
                                </tr>`);                             added_moves += 1;
                                    }
                                }

                                while (added_moves < 9){
                                    normal_array.push(`<tr>${"<td></td>".repeat(8)}</tr>`);
                                    added_moves++;
                                }

                                normal_array.push(`</table>`);
                                //

                                let normalTable = "";
                                normal_array.forEach((item,i) => {
                                    normalTable += item;
                                })

                                container.innerHTML += normalTable;
                                let eggTable = "";
                                egg_move_array.forEach((item,i) => {
                                    eggTable += item;
                                })

                                container.innerHTML += eggTable;

                                const tutor_point = Math.floor(level/5);
                                container.innerHTML += `<p><b>Tutor points:</b> ${tutor_point}</p>`;


                                container.innerHTML += `<h2>Notes</h2>`;
                                container.innerHTML += `<p>Egg moves: ${
                                    egg_moves.length === 0
                                        ? "None"
                                        : egg_moves.map(e=>e.move).join(", ")
                                }</p>`;

                                container.innerHTML += `<p>TM moves: ${
                                    tmhm_moves.length === 0
                                        ? "None"
                                        : tmhm_moves.map(e=>e.move).join(", ")
                                }</p>`;


                                /* COPY AS RICH TEXT */

                                document.body.appendChild(container);

                                const range = document.createRange();
                                range.selectNode(container);

                                const selection = window.getSelection();
                                selection.removeAllRanges();
                                selection.addRange(range);

                                document.execCommand("copy");

                                selection.removeAllRanges();
                                container.remove();

                                console.log("Formatted content copied! Paste into Google Docs.");
                            }}> Copy google doc version to clipboard </Button></div>
                        <br></br>
                        <br></br>
                        <br></br>
                    </div>
                }
            </div></div>
    );

}

export default PokemonGenerator;
