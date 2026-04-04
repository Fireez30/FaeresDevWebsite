import { configureStore } from '@reduxjs/toolkit'
import pokemonReducer from '../features/pokemon/pokemonSlice.jsx'
export default configureStore({
    reducer: {
        pokemon: pokemonReducer
    }
})