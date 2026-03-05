import { Layout} from 'antd';
const { Footer } = Layout;

function CustomFooter() {
    return (<Footer className="MainFooter">
        Faeres dev website ©{new Date().getFullYear()} Created by Faeres, with React, Antd
    </Footer>);
}

export default CustomFooter;