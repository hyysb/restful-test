import React from 'react';
import axios from 'axios'; // 引入axios库
import { Table, Input, Divider, Form, Popconfirm, Icon, Select, message } from 'antd';

import ContentTop from './ContentTop';
import './Content.css';

const { Option } = Select;

const PRIVS = {
    "user_config": "用户配置",
    "basic_config": "常规配置",
    "safe_config": "安全配置",
    "remote_ctrl": "远程控制",
    "remote_media": "远程媒体",
    "power_config": "电源控制",
    "maintenance": "维护诊断",
    "query": "查询",
    "self_config": "配置自身",
};

const EditableContext = React.createContext();
class EditableCell extends React.Component {
    getDataType = () => {
        if(this.props.dataType === 'select') {
            if(this.props.dataIndex === 'priv') {
                const privKey = Object.keys(PRIVS);
                return (
                    <Select initialValue="user_config" style={{ width: 120 }}>
                        {
                            privKey.map((priv) => (
                                <Option value={priv} key={priv}>{PRIVS[priv]}</Option>
                            ))
                        }
                    </Select>
                )
            }
            if(this.props.dataIndex === "way") {
                return (
                    <Select initialValue="get" style={{ width: 120 }}>
                        <Option value="get">GET</Option>
                        <Option value="post">POST</Option>
                        <Option value="put">PUT</Option>
                        <Option value="delete">DELETE</Option>
                    </Select>
                )
            }
            return <Input />
        }
        return <Input />
    }
    renderCell = ({getFieldDecorator}) => {
        const {
            editing,
            dataIndex,
            title,
            record,
            dataType,
            index,
            children,
            ...restProps
        } = this.props;
        return (
            <td {...restProps}>
                {editing ? (
                    <Form.Item>
                        {getFieldDecorator(dataIndex, {
                            rules: [{
                                required: (dataIndex === "request") ? false : true,
                                message: `请输入${title}`,
                            }],
                            initialValue: record[dataIndex]
                        })(this.getDataType())}
                    </Form.Item>
                ) : (
                    children
                )}
            </td>
        )
    }

    render() {
        return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>
    }
}

class ShowTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            count: 0,
            editingID: '',
            isAdd: false,
        };
        this.columns = [{
            title: '权限',
            dataIndex: 'priv',
            key: 'priv',
            dataType: 'select',
            editable: true,
            width: '15%',
            render: (text, record) => (
                PRIVS[record.priv]
            ),
            sorter: (a, b) => (a.priv.localeCompare(b.priv)),
            filters: [{
                text: '用户权限',
                value: 'user_config'
            }, {
                text:'常规配置',
                value: 'basic_config'
            }, {
                text:'安全配置',
                value: 'safe_config'
            }, {
                text:'远程控制',
                value: 'remote_ctrl'
            }, {
                text:'远程媒体',
                value: 'remote_media'
            }, {
                text:'电源控制',
                value: 'power_config'
            }, {
                text:'维护诊断',
                value: 'maintenance'
            }, {
                text:'查询',
                value: 'query'
            }, {
                text:'配置自身',
                value: 'self_config'
            }],
            onFilter: (value, record) => ( record.priv === value ),
        }, {
            title: '下发方式',
            dataIndex: 'way',
            key: 'way',
            dataType: 'select',
            editable: true,
            width: '15%',
            sorter: (a, b) => (a.priv.localeCompare(b.priv)),
            render: (text, record) => (record.way.toUpperCase())
        },{
            title: '接口',
            dataIndex: 'api',
            key: 'api',
            editable: true,
            width: '15%',
        },{
            title: '请求数据(POST/PUT)',
            dataIndex: 'request',
            key: 'request',
            editable: true,
            width: '25%',
            render: (text, record) => {
                return (record.request !== undefined && record.request !== "") ? (
                    record.request
                ) : (
                    <span>~</span>
                )
            }
        },{
            title: '操作',
            dataIndex: 'operate',
            key: 'operate',
            width: '30%',
            render: (text, record) => {
                const {editingID} = this.state;
                const editable = this.isEditing(record);
                const EditIcon = () => editingID === '' ? (
                    <Icon type="edit" theme="twoTone" onClick={() => this.edit(record.id)} style={{ fontSize: '16px' }} />
                ) : (
                    <Icon type="edit" theme="twoTone" twoToneColor="#666699" style={{ fontSize: '16px' }} />
                );
                return editable ? (
                    <span>
                        <EditableContext.Consumer>
                            {
                                form => (
                                    <Popconfirm 
                                        title="确认修改？" 
                                        okText='确认' 
                                        cancelText='取消' 
                                        onConfirm={() => this.save(form, record.id)}
                                    >
                                        <Icon type="save" theme="twoTone" style={{ fontSize: '16px' }} />
                                    </Popconfirm>
                                )
                            }
                        </EditableContext.Consumer>
                        <Divider type="vertical" />
                        <Icon type="close-circle" 
                            theme="twoTone" 
                            style={{ fontSize: '16px' }}
                            onClick={() => this.cancel(record.id)}  
                        />
                    </span>
                ) : (
                    <span>
                        <EditIcon />
                        <Divider type="vertical" />
                        <Popconfirm 
                            title="确认删除？" 
                            okText='确认' 
                            cancelText='取消' 
                            onConfirm={() => this.delete(record.id)}
                        >
                            <Icon type="delete" theme="twoTone" twoToneColor="#ff0000" style={{ fontSize: '16px' }} />
                        </Popconfirm>
                    </span>
                )
            },
        }];
    }

    componentDidMount() {
       this.getRestfulData();
    }

    getRestfulData() {
        this.setState({ loading: true });
        axios.get('/restful')
            .then(res => {
                this.setState({
                    data: res.data,
                    count: res.data.length,
                    loading: false,
                })
            })
            .catch(err => {
                console.log(err);
                this.setState({ loading: false });
            })
    }

    isEditing = record => record.id === this.state.editingID;

    addRestful= () => {
        const { count, data } = this.state;
        const newData = {
            "id": count + 1,
            "way": "get",
            "api": "",
            "priv": "user_config",
            "result": ""
        };
        this.setState({
            data: [...data, newData],
            count: count + 1,
            editingID: count + 1,
            isAdd: true,
        });
    }

    edit(id) {
        this.setState({editingID: id});
    }

    cancel = (id) => {
        if(this.state.isAdd) {
            let data = this.state.data;
            data.pop();
            this.setState({
                data: data,
                editingID: '',
                isAdd: false
            })
        } else {
            this.setState({
                editingID: ''
            })
        }
    }

    save(form, id) {
        this.setState({ loading: true });
        form.validateFields((error, row) => {
            if(error) {
                return;
            }
            const newData = [...this.state.data];
            const index = newData.findIndex(item => id === item.id);
            axios.post('/restful', Object.assign(newData[index], row))
                .then(res => {
                    this.setState({ loading: false });
                    if(res.data.cc === 0) {
                        const data = res.data.data;
                        this.setState({
                            data: data,
                            count: data.length,
                            editingID: ''
                        })
                    } else {
                        console.log('err');
                    }
                })
                .catch(err => {
                    this.setState({ loading: false });
                    console.log(err);
                })
        })
    }

    delete(id) {
        this.setState({ loading: true });
        axios.delete(`/restful/${id}`)
                .then(res => {
                    this.setState({ loading: false });
                    if(res.data.cc === 0) {
                        const data = res.data.data;
                        this.setState({
                            data: data,
                            count: data.length,
                            editingID: ''
                        })
                    } else {
                        console.log('err');
                    }
                })
                .catch(err => {
                    this.setState({ loading: false });
                    console.log(err);
                })
    }

    render() {
        const components = {
            body: {
                cell: EditableCell,
            }
        }

        const columns = this.columns.map(col => {
            if(!col.editable) {
                return col;
            }

            return {
                ...col,
                onCell: record => ({
                    record, 
                    dataIndex: col.dataIndex,
                    title: col.title,
                    dataType: col.dataType || '',
                    editing: this.isEditing(record),
                })
            }
        })

        return (
            <div>
                <ContentTop addRestful={this.addRestful} isEditing={!(this.state.editingID === '')} />
                <EditableContext.Provider value={this.props.form}>
                    <Table
                        id="privTable"
                        rowKey="id"
                        components={components}
                        dataSource={this.state.data} 
                        columns={columns}
                        rowSelection={{}}
                        loading={this.state.loading}
                        pagination={{
                            onChange: this.cancel,
                        }}
                        locale={{
                            filterConfirm: '确定',
                            filterReset: '重置'
                        }}
                    />
                </EditableContext.Provider>
            </div>
        );
    }
}

const Content = Form.create()(ShowTable);

export default Content;