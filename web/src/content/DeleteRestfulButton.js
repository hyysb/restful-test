import React, { Fragment } from 'react';
import { Modal, Button } from 'antd';

// 删除接口
const { confirm } = Modal;

function showDeleteConfirm() {
    confirm({
        title: '删除接口',
        content: '确认删除这些接口？',
        okText: '确认',
        cancelText: '取消',
        onOk() {
          return new Promise((resolve, reject) => {
            setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
          }).catch(() => console.log('Oops errors!'));
        },
        onCancel() {},
    });
}

const DeleteRestfulButton = (props) => (
    <Fragment>
        <Button  
            type="danger" 
            style={props.style}
            onClick={showDeleteConfirm}
        >
            删除接口 
        </Button>
    </Fragment>
);

export default DeleteRestfulButton;