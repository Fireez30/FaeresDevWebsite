import React, {useState} from "react";
import {setGender} from "../features/pokemon/pokemonSlice.jsx";
import Button from 'react-bootstrap/Button';
function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
function Rolls() {
    const [dexnav, setDexnav] = useState(0);
    const [pokemonShinyRoll, setPokemonShinyRoll] = useState(1);
    const [cardRoll1, setcardRoll1] = useState(1);
    const [cardRoll2, setcardRoll2] = useState(33);
    const [cardRoll3, setcardRoll3] = useState(66);
    const [cardShinyRoll1, setcardShinyRoll1] = useState(22);
    const [cardShinyRoll2, setcardShinyRoll2] = useState(44);
    const [rolled_encounter_bracket,setRolledEncounterBracket] = useState(-1);
    const [rolled_encounter_count,setRolledEncounterCount] = useState(-1);
    return (
        <div style={{marginLeft:'5px',width:'100%',color:'white'}}>
            <div >
            <h3>Encounter rolls</h3>
                <Button style={{marginLeft:'5px',marginRight:'5px',marginTop:'5px',width:'5%',height:'30px'}} onClick={() => {
                    const rolled_encounter_bracket_temp = getRandomArbitrary(0,100)+1;
                    const rolled_encounter_count_temp = getRandomArbitrary(0,20)+1;
                    setRolledEncounterBracket(rolled_encounter_bracket_temp);
                    setRolledEncounterCount(rolled_encounter_count_temp);

                }}>
                    Roll
                </Button>
                { rolled_encounter_bracket !== -1 &&
                    <text>Bracket of encouter : <text style={{'color':(rolled_encounter_bracket===1?'red':rolled_encounter_bracket===100?'green':'white')}}>{rolled_encounter_bracket} / 100</text><br/></text>
                }
                { rolled_encounter_count !== -1 &&
                    <text style={{marginLeft:'6%'}}> Count of encouter : <text style={{'color':(rolled_encounter_count===1?'red':rolled_encounter_count===20?'green':'white')}}>{rolled_encounter_count} / 100</text></text>
}
            </div>
            <div >
            <h3>Capture rolls</h3>
            </div>
            <div >
            <h3>Shiny rolls</h3>
            </div >
            <div >
            <h3>Card rolls</h3>
            </div>
        </div>
    );
}

export default Rolls;