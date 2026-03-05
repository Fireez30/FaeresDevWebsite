import { useState } from 'react'
import './App.css'
import React from 'react';
import { Layout } from 'antd';
import CustomRouter from "./CustomRouter.jsx";
import CustomFooter from "./CustomFooter.jsx";
import CustomHeader from "./CustomHeader.jsx";
const {  Content } = Layout;

function App() {
  const [count, setCount] = useState(0)
  return (
    <Layout style={{minHeight: "100vh", display: "flex"}}>
        <CustomHeader></CustomHeader>
        <Content className="MainFrame">
                <CustomRouter></CustomRouter>
        </Content>
        <CustomFooter></CustomFooter>
    </Layout>
  )
}

export default App
