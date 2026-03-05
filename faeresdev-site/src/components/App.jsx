import { useState } from 'react'
import './App.css'
import React from 'react';
import { Layout } from 'antd';
import CustomFooter from "./CustomFooter.jsx";
import CustomHeader from "./CustomHeader.jsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import PokemonGenerator from "./PokemonGenerator.jsx";
import Empty from "./Empty.jsx";

const {  Content } = Layout;

function App() {
  const [count, setCount] = useState(0)
  return (
    <Layout style={{minHeight: "100vh", display: "flex"}}>
        <BrowserRouter>
        <CustomHeader></CustomHeader>
            <Content className="MainFrame">
                <Routes>
                    <Route exact path={"/"} element={<PokemonGenerator />} />
                    <Route exact path={"/pokemon"} element={<PokemonGenerator />} />
                    <Route exact path={"/others"} element={<Empty />} />
                </Routes>
            </Content>

            <CustomFooter></CustomFooter>
            </BrowserRouter>
    </Layout>
  )
}

export default App
