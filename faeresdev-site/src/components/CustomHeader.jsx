import { Layout,Menu} from 'antd';
import React from "react";
import {Link, useNavigate} from "react-router-dom";
const { Header } = Layout;
const items = [
    {key: 0,label: 'Home'},
    {key: 1,label: 'Pokemon',},
    {key: 2,label: 'Others'},
];
function CustomHeader(props) {
    return (
        <Header style={{alignItems: 'center',backgroundColor:'#3d3b3b'}}>
            <div className="demo-logo" />
            <Menu
                mode="horizontal"
                defaultSelectedKeys={['0']}
                onClick={(key) =>  {
                    if (key === 0){ props.history.push('/') }
                    if (key === 1){ props.history.push('/pokemon') }
                    if (key === 2){ props.history.push('/others') }
                }}
                items={items}
                style={{ flex: 1, minWidth: 0,backgroundColor:'#3d3b3b'}}
            />
        </Header>
    );
}

export default CustomHeader;