import React, { Fragment } from 'react';
import {  Button } from 'antd';


// 上方按钮栏
const ContentTop = (props) => (
    <div style={{padding: '20px'}} id='operate'>
        {
            props.isEditing ? (
                <Fragment>
                    <Button disabled>开始测试</Button>
                    <Button disabled type="primary">
                        增加接口
                    </Button>
                </Fragment>
            ) : (
                <Fragment>
                    <Button>开始测试</Button>
                    <Button onClick={props.addRestful} type="primary">
                        增加接口
                    </Button>
                </Fragment>
            )
        }
    </div>
);

export default ContentTop;
