import React from 'react';
import './App.css';

import ContentTemplate from './content/Content';

import { Layout } from 'antd';
const { Header, Footer, Content } = Layout;

const App = () => (
    <div id='app'>
        <Layout>
            <Header>
                Restful 接口权限测试工具
            </Header>
            <Content>
                <ContentTemplate />
            </Content>
            {/* <Footer>Footer</Footer> */}
        </Layout>
    </div>
)

export default App;
