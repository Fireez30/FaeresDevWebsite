import { Layout,Menu} from 'antd';
import CustomRouter from "./CustomRouter.jsx";
import React from "react";
const { Header } = Layout;
const items = [
    {key: 0,label: `Home`,color:'white'},
    {key: 1,label: `Pokemon generator`,color:'white'},
    {key: 2,label: `Todo`,color:'white'},
];
function CustomHeader() {
    return (
        <Header style={{alignItems: 'center',backgroundColor:'#3d3b3b'}}>
            <div className="demo-logo" />
            <Menu
                mode="horizontal"
                defaultSelectedKeys={['0']}
                items={items}
                style={{ flex: 1, minWidth: 0,backgroundColor:'#3d3b3b'}}
            />
        </Header>
    );
}

export default CustomHeader;