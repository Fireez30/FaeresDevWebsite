import './App.css'
import React from 'react';
import { Layout,Menu } from 'antd';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import PokemonGenerator from "./PokemonGenerator.jsx";
import PokemonTeamCard from "./PokemonTeamCard.jsx";
import Rolls from "./rolls.jsx";
import HiraganaTrainer from "./HiraganaTrainer.jsx";
import KatakanaTrainer from "./KatakanaTrainer.jsx";
import KanjiTrainer from "./KanjiTrainer.jsx";
import KanjiWritingTrainer from "./KanjiWritingTrainer.jsx";
import JapaneseSentenceColorTrainer from "./JapaneseSentenceColorTrainer.jsx";
import VocabularyTrainer from "./VocabularyTrainer.jsx";
import KatakanaWordTrainer from "./KatakanaWordTrainer.jsx";
import DeckManager from "./DeckManager.jsx";
import Home from "./Home.jsx";
import PokemonEncounterGenerator from "./PokemonEncounterGenerator.jsx";
import PokemonTeamManager from "./PokemonTeamManager.jsx";
const { Header,Footer,Content } = Layout;

const items = [
    {key: '/',label: 'Home'},
    {
        key: 'pokemon-rpg',
        label: 'Pokemon RPG tools',
        children: [
            {key:'generators',label:'Pokemon Generators',children : [{key: '/pokemon-generator',label: 'Pokemon Generator'},{key: '/pokemon-encounter-generator',label: 'Pokemon Encounter Generator'}]},
            {key: '/pokemon-rolls',label: 'Pokemon Dice Rolls'},
            {key: '/pokemon-team-card',label: 'Pokemon Team Card'},
            {key: '/pokemon-team-manager',label: 'Pokemon Team Manager'},

        ],
    },
    {
        key: 'japanese',
        label: 'Japanese tools',
        children: [
            {key:'hiragana',label:'Hiragana training',children : [{key: '/hiragana-training',label: 'Hiragana Training cards'}]},
            {key:'katakana',label:'Katakana training',children : [{key: '/katakana-training',label: 'Katakana Training  cards'}, {key: '/katakana-word-training',label: 'Katakana Word Trainer'}]},
            {key:'vocabulary',label:'Vocabulary training',children : [{key: '/kanji-training',label: 'Kanji Training cards'},{key: '/kanji-writing-trainer',label: 'Kanji Writing Trainer'},{key: '/vocabulary-training',label: 'Vocabulary Training'},]},
            {key: '/japanese-sentence-color-trainer',label: 'Japanese sentences tokens training'},
            {key: '/deck-manager',label: 'Deck Manager'},
        ],
    },
];

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Layout className="site-shell">
        <Header className="site-header">
            <Link className="site-brand" to="/">
                <img className="main-logo" src="/logo_faeresdev_inverted_cropped.png"/>
            </Link>
            <Menu
                className="site-nav"
                mode="horizontal"
                selectedKeys={[location.pathname]}
                onClick={({ key }) => navigate(key)}
                overflowedIndicator={<span className="site-nav-overflow">More</span>}
                items={items}
            />
        </Header>
        <Content className="MainFrame">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/pokemon-generator" element={<PokemonGenerator />} />
                <Route path="/pokemon-rolls" element={<Rolls />} />
                <Route path="/pokemon-team-card" element={<PokemonTeamCard />} />
                <Route path="/pokemon-team-manager" element={<PokemonTeamManager />} />
                <Route path="/hiragana-training" element={<HiraganaTrainer />} />
                <Route path="/katakana-training" element={<KatakanaTrainer />} />
                <Route path="/kanji-training" element={<KanjiTrainer />} />
                <Route path="/kanji-writing-trainer" element={<KanjiWritingTrainer />} />
                <Route path="/japanese-sentence-color-trainer" element={<JapaneseSentenceColorTrainer />} />
                <Route path="/pokemon-encounter-generator" element={<PokemonEncounterGenerator />} />
                <Route path="/vocabulary-training" element={<VocabularyTrainer />} />
                <Route path="/katakana-word-training" element={<KatakanaWordTrainer />} />
                <Route path="/deck-manager" element={<DeckManager />} />
                <Route path="*" element={<Home />} />
            </Routes>
        </Content>

        <Footer className="MainFooter">
            Faeres dev website ©{new Date().getFullYear()} Created by Faeres, with React, Antd. Some components were adapted using OpenAi Codex tool, for test purposes
        </Footer>
    </Layout>
  )
}

export default App
