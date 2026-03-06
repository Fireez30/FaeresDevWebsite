import React, {useState} from "react";
import {setGender, setLevel} from "../features/pokemon/pokemonSlice.jsx";
import Button from 'react-bootstrap/Button';
import {InputNumber} from "antd";
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

function Rolls() {
    const [dexnav, setDexnav] = useState(0);
    const [pokemonShinyRoll, setPokemonShinyRoll] = useState(1);
    const [number_of_shiny_to_roll, setNumberOfShinyToRoll] = useState(1);
    const [cardRoll1, setcardRoll1] = useState(1);
    const [cardRoll2, setcardRoll2] = useState(33);
    const [cardRoll3, setcardRoll3] = useState(66);
    const [cardShinyRoll1, setcardShinyRoll1] = useState(22);
    const [cardShinyRoll2, setcardShinyRoll2] = useState(44);
    const [rolled_encounter_bracket,setRolledEncounterBracket] = useState(-1);
    const [roll_capture_accuracy,setRollCaptureAccuracy] = useState(-1);
    const [roll_capture_rate,setRollCaptureRate] = useState(-1);
    const [rolled_encounter_count,setRolledEncounterCount] = useState(-1);
    const [list_rolls_shiny_poke,setListRollsShinyPoke] = useState([]);

    if (getCookie("dexnav")){
        let cookie_value = parseInt(getCookie("dexnav"));
        if (cookie_value !== dexnav){
            setDexnav(parseInt(getCookie("dexnav")));
        }

    }

    if (getCookie("pokemonShinyRoll")){
        let cookie_value = parseInt(getCookie("pokemonShinyRoll"));
        if (cookie_value !== pokemonShinyRoll){
            setPokemonShinyRoll(parseInt(getCookie("pokemonShinyRoll")));
        }

    }
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
                    <text>Bracket of encouter : <text style={{'color':(rolled_encounter_bracket===1?'red':rolled_encounter_bracket===100?'#00ff14':'white')}}>{rolled_encounter_bracket} / 100</text><br/></text>
                }
                { rolled_encounter_count !== -1 &&
                    <text style={{marginLeft:'6%'}}> Count of encouter : <text style={{'color':(rolled_encounter_count===1?'red':rolled_encounter_count===20?'#00ff14':'white')}}>{rolled_encounter_count} / 20</text></text>
                }
            </div>
            <div >
            <h3>Capture rolls</h3>
                <Button style={{marginLeft:'5px',marginRight:'5px',marginTop:'5px',width:'5%',height:'30px'}} onClick={() => {
                    const roll_capture_accuracy_temp = getRandomArbitrary(0,20)+1;
                    const roll_capture_rate_temp = getRandomArbitrary(0,100)+1;
                    setRollCaptureAccuracy(roll_capture_accuracy_temp);
                    setRollCaptureRate(roll_capture_rate_temp);

                }}>
                    Roll
                </Button>
                { roll_capture_accuracy !== -1 &&
                    <text>Capture accuracy : <text style={{'color':(roll_capture_accuracy===1?'red':roll_capture_accuracy===20?'#00ff14':'white'),'border':(roll_capture_accuracy===1?'solid 1px red':roll_capture_accuracy===20?'solid 1px #00ff14':'')}}>{roll_capture_accuracy}</text><text> / 20</text><br/></text>
                }
                { roll_capture_rate !== -1 &&
                    <text style={{marginLeft:'6%'}}> Capture rate : <text style={{'color':(roll_capture_rate===1?'red':roll_capture_rate===100?'#00ff14':'white'),'border':(roll_capture_rate===1?'solid 1px red':roll_capture_rate===100?'solid 1px #00ff14':'')}}>{roll_capture_rate}</text><text> / 100</text></text>
                }
            </div>
            <div >
            <h3>Shiny rolls</h3>
                Your shiny number :
                <InputNumber
                min={1}
                max={99}
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
                style={{marginLeft:'5px',marginTop:'5px',width:'8%',height:'30px'}}>
            </InputNumber> <br></br>
                Dexnav :
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
                    style={{marginLeft:'5px',marginTop:'5px',width:'8%',height:'30px'}}>
                </InputNumber> <br></br>
                Number of dice rolls :
                <InputNumber
                    min={1}
                    max={99}
                    defaultValue={1}
                    value={number_of_shiny_to_roll}
                    onChange={value => {
                        if (value){
                            setNumberOfShinyToRoll(value);
                        }

                    }}
                    style={{marginLeft:'5px',marginTop:'5px',width:'8%',height:'30px'}}>
                </InputNumber> <br></br>
                <Button style={{marginLeft:'5px',marginRight:'5px',marginTop:'5px',width:'5%',height:'30px'}} onClick={() => {
                    let rolls = [];
                    let final_rolls = [];
                    let reroll_under_or_equal = dexnav;
                    if (pokemonShinyRoll < dexnav){ // if we roll under dexnav, we have to shift the reroll window
                        reroll_under_or_equal += 1;
                    }
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
                    <div>
                        <text>List of rolls : </text>
                        {
                            list_rolls_shiny_poke.map((roll,index) => {
                                return <text style={{'color':(roll===pokemonShinyRoll?'#00ff14':roll===100?'cyan':'white')}}>{roll} </text>
                            })
                        }

                    </div>
                }
            </div >
            <div >
            <h3>Card rolls</h3>
            </div>
        </div>
    );
}

export default Rolls;