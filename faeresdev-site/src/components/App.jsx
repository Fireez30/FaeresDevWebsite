import { useState } from 'react'
import './App.css'
import React from 'react';
import { Layout,Menu } from 'antd';
import PokemonGenerator from "./PokemonGenerator.jsx";
import Rolls from "./rolls.jsx";
import Empty from "./Empty.jsx";
const { Header,Footer,Content } = Layout;

const items = [
    {key: 0,label: 'Home'},
    {key: 1,label: 'Pokemon Generator',},
    {key: 2,label: 'Pokemon rolls'},
    {key: 3,label: 'Others'},
];

function App() {
  const [count, setCount] = useState(0);
  const [current_key,setCurrentKey] = useState("home")
  return (
    <Layout style={{minHeight: "100vh", display: "flex"}}>
        <Header style={{alignItems: 'center',backgroundColor:'#3d3b3b'}}>
            <div className="demo-logo" />
            <Menu
                mode="horizontal"
                defaultSelectedKeys={[0]}
                onClick={(key) =>  {
                    if (key.key === 0 || key.key === "0"){ setCurrentKey("home") }
                    if (key.key === 1 || key.key === "1"){ setCurrentKey('pokemon') }
                    if (key.key === 2 || key.key === "2"){ setCurrentKey('rolls') }
                    if (key.key === 3 || key.key === "3"){ setCurrentKey('others') }
                }}
                items={items}
                style={{ flex: 1, minWidth: 0,backgroundColor:'#3d3b3b'}}
            />
        </Header>
        <Content className="MainFrame">
            {current_key === "home" ?
                <Empty />
            : current_key === "pokemon" ?
                <PokemonGenerator />
            : current_key === "rolls" ?
                <Rolls />
            :
                <Empty />
            }
        </Content>

        <Footer className="MainFooter">
            Faeres dev website ©{new Date().getFullYear()} Created by Faeres, with React, Antd
        </Footer>
    </Layout>
  )
}

export default App
