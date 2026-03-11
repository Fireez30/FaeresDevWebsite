import { createSlice } from '@reduxjs/toolkit'

export const pokemonSlice = createSlice({
    name: 'pokemon',
    initialState: {
        remaining_rolls : 3,
        chosen_pokemon : "",
        pokemon_level : 0,
        pokemon_rarity : "Normal",
        pokemon_card : "None",
        pokemon_gender : "",
        pokemon_nature : "",
        pokemon_final_buffed_stat : "",
        pokemon_final_lowered_stat : "",
        pokemon_base_ability : "",
        pokemon_advanced_ability : "",
        pokemon_high_ability : "",
        pokemon_points_by_stats : {"HP":0,"ATK":0,"DEF":0,"SPATK":0,"SPDEF":0,"SPD":0},
        pokemon_bonus_points_by_stats : {"HP":0,"ATK":0,"DEF":0,"SPATK":0,"SPDEF":0,"SPD":0},
        pokemon_bonus_points_to_nature_stat : 0,
        pokemon_chosen_moves : [],
        pokemon_chosen_egg_moves : [],
    },
    reducers: {
        choose_pokemon: (state, action) => {
            console.log("chosen : "+action.payload)
            if (action.payload.chosen_pokemon !== "" && action.payload.chosen_pokemon !== state.chosen_pokemon) {
                state.remaining_rolls = 3;
                state.chosen_pokemon = action.payload.chosen_pokemon;
                state.pokemon_level = -1;
                state.pokemon_rarity = "Normal";
                state.pokemon_card = "None";
                state.pokemon_gender = "";
                state.pokemon_nature = "";
                state.pokemon_final_buffed_stat = "";
                state.pokemon_final_lowered_stat = "";
                state.pokemon_base_ability = "";
                state.pokemon_advanced_ability = "";
                state.pokemon_high_ability = "";
                state.pokemon_points_by_stats = {"HP":0,"ATK":0,"DEF":0,"SPATK":0,"SPDEF":0,"SPD":0};
                state.pokemon_bonus_points_to_nature_stat = 0;
                state.pokemon_chosen_moves = [];
                state.pokemon_chosen_egg_moves = [];
            }
        },
        decrement_remaining_rolls: state => {
            state.remaining_rolls = Math.max(0, state.remaining_rolls-1);
        },
        setLevel: (state, action) => {
            state.pokemon_level = action.payload.pokemon_level
            if (state.pokemon_level < 40 && state.pokemon_high_ability !== ""){
                state.pokemon_high_ability = ""
            }
            if (state.pokemon_level < 20 && state.pokemon_advanced_ability !== ""){
                state.pokemon_advanced_ability = ""
            }
        },
        setRarity: (state, action) => {
            state.pokemon_rarity = action.payload.pokemon_rarity
        },
        setCard: (state, action) => {
            state.pokemon_card = action.payload.pokemon_card
        },
        setGender: (state, action) => {
            state.pokemon_gender = action.payload.pokemon_gender
        },
        setNature: (state, action) => {
            state.pokemon_nature = action.payload.pokemon_nature
        },
        setBuffedStat: (state, action) => {
            state.pokemon_final_buffed_stat = action.payload.pokemon_final_buffed_stat
        },
        setLoweredStat: (state, action) => {
            state.pokemon_final_lowered_stat = action.payload.pokemon_final_lowered_stat
        },
        setBaseAbility: (state, action) => {
            state.pokemon_base_ability = action.payload.pokemon_base_ability
        },
        setAdvancedAbility: (state, action) => {
            state.pokemon_advanced_ability = action.payload.pokemon_advanced_ability
        },
        setHighAbility: (state, action) => {
            state.pokemon_high_ability = action.payload.pokemon_high_ability
        },
        setPointsByStat: (state, action) => {
            for (let stat in action.payload.pokemon_points_by_stats){
                state.pokemon_points_by_stats[stat] = action.payload.pokemon_points_by_stats[stat]
            }
        },
        setBonusPointsByStat: (state, action) => {
            state.pokemon_bonus_points_by_stats = action.payload.pokemon_bonus_points_by_stats
        },
        setBonusPointsToNatureStat(state, action) {
            state.pokemon_bonus_points_to_nature_stat = action.payload.pokemon_bonus_points_to_nature_stat
        },
        addMovePokemonChosenMoves(state, action) {
            let move_obj = action.payload.pokemon_chosen_moves;
            state.pokemon_chosen_moves.push(move_obj);
        },
        removeMovePokemonChosenMoves(state, action) {
            let move_index = action.payload.pokemon_chosen_moves;
            state.pokemon_chosen_moves.splice(move_index, 1);

        },
        addMovePokemonEggMoves(state, action) {
            let move_obj = action.payload.pokemon_chosen_egg_moves;
            state.pokemon_chosen_egg_moves.push(move_obj);
        },
        removeMovePokemonEggMoves(state, action) {
            let move_index = action.payload.pokemon_chosen_egg_moves;
            state.pokemon_chosen_egg_moves.splice(move_index, 1);

        },
    }
})

// Action creators are generated for each case reducer function
export const {addMovePokemonEggMoves,removeMovePokemonEggMoves, decrement_remaining_rolls,choose_pokemon ,setLevel,setRarity,setCard, setGender,setNature,setBuffedStat,setLoweredStat,setBaseAbility,setAdvancedAbility,setHighAbility,setPointsByStat,setBonusPointsByStat,setBonusPointsToNatureStat,setPokemonChosenMoves,addMovePokemonChosenMoves,removeMovePokemonChosenMoves} = pokemonSlice.actions

export default pokemonSlice.reducer