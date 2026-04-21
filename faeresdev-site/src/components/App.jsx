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
import JapaneseSentenceColorTrainer from "./JapaneseSentenceColorTrainer.jsx";
import Empty from "./Empty.jsx";
import PokemonEncounterGenerator from "./PokemonEncounterGenerator.jsx";
const { Header,Footer,Content } = Layout;

const items = [
    {key: '/',label: 'Home'},
    {
        key: 'pokemon-rpg',
        label: 'Pokemon RPG',
        children: [
            {key: '/pokemon-generator',label: 'Pokemon Generator'},
            {key: '/pokemon-rolls',label: 'Pokemon Rolls'},
            {key: '/pokemon-team-card',label: 'Pokemon Team Card'},
            {key: '/pokemon-encounter-generator',label: 'Pokemon Encounter Generator'},
        ],
    },
    {
        key: 'japanese',
        label: 'Japonais',
        children: [
            {key: '/hiragana-training',label: 'Hiragana Training'},
            {key: '/katakana-training',label: 'Katakana Training'},
            {key: '/kanji-training',label: 'Kanji Training'},
            {key: '/japanese-sentence-color-trainer',label: 'Color Sentence Trainer'},
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
                <span className="site-brand-mark">FD</span>
                <span className="site-brand-text">Faeres Dev</span>
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
                <Route path="/" element={<Empty />} />
                <Route path="/pokemon-generator" element={<PokemonGenerator />} />
                <Route path="/pokemon-rolls" element={<Rolls />} />
                <Route path="/pokemon-team-card" element={<PokemonTeamCard />} />
                <Route path="/hiragana-training" element={<HiraganaTrainer />} />
                <Route path="/katakana-training" element={<KatakanaTrainer />} />
                <Route path="/kanji-training" element={<KanjiTrainer />} />
                <Route path="/japanese-sentence-color-trainer" element={<JapaneseSentenceColorTrainer />} />
                <Route path="/pokemon-encounter-generator" element={<PokemonEncounterGenerator />} />
                <Route path="*" element={<Empty />} />
            </Routes>
        </Content>

        <Footer className="MainFooter">
            Faeres dev website ©{new Date().getFullYear()} Created by Faeres, with React, Antd. Some components were adapted using OpenAi Codex tool, for test purposes
        </Footer>
    </Layout>
  )
}

export default App
