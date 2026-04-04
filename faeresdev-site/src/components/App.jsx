import { useState } from 'react'
import './App.css'
import React from 'react';
import { Layout,Menu } from 'antd';
import PokemonGenerator from "./PokemonGenerator.jsx";
import Rolls from "./rolls.jsx";
import HiraganaTrainer from "./HiraganaTrainer.jsx";
import KatakanaTrainer from "./KatakanaTrainer.jsx";
import Empty from "./Empty.jsx";
const { Header,Footer,Content } = Layout;

const items = [
    {key: 0,label: 'Home'},
    {key: 1,label: 'Pokemon Generator',},
    {key: 2,label: 'Pokemon rolls'},
    {key: 3,label: 'Hiragana Training'},
    {key: 4,label: 'Katakana Training'},
];

function App() {
  const [current_key,setCurrentKey] = useState("home")
  return (
    <Layout className="site-shell">
        <Header className="site-header">
            <div className="site-brand">
                <span className="site-brand-mark">FD</span>
                <span className="site-brand-text">Faeres Dev</span>
            </div>
            <Menu
                className="site-nav"
                mode="horizontal"
                defaultSelectedKeys={[0]}
                onClick={(key) =>  {
                    if (key.key === 0 || key.key === "0"){ setCurrentKey("home") }
                    if (key.key === 1 || key.key === "1"){ setCurrentKey('pokemon') }
                    if (key.key === 2 || key.key === "2"){ setCurrentKey('rolls') }
                    if (key.key === 3 || key.key === "3"){ setCurrentKey('hiragana') }
                    if (key.key === 4 || key.key === "4"){ setCurrentKey('katakana') }
                }}
                items={items}
            />
        </Header>
        <Content className="MainFrame">
            {current_key === "home" ?
                <Empty />
            : current_key === "pokemon" ?
                <PokemonGenerator />
            : current_key === "rolls" ?
                <Rolls />
            : current_key === "hiragana" ?
                <HiraganaTrainer />
            : current_key === "katakana" ?
                <KatakanaTrainer />
            :
                <Empty />
            }
        </Content>

        <Footer className="MainFooter">
            Faeres dev website ©{new Date().getFullYear()} Created by Faeres, with React, Antd. Some components were adapted using OpenAi Codex tool, for test purposes
        </Footer>
    </Layout>
  )
}

export default App
