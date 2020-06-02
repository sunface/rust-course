import React from 'react'
import { Form, Input, Button } from 'antd';
import { useHistory } from 'react-router-dom';
import './index.css'

import { inject, observer } from 'mobx-react'

// eslint-disable-next-line import/order, import/no-unresolved
import storage from '../../library/utils/localStorage'

import request from '../../library/utils/http' 
import { isEmpty } from '../../library/utils/validate'
import { setToken } from '../../library/utils/auth';


function FormBox(props) {
    const {account:acc} = props
    const layout = {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
    };
    const tailLayout = {
        wrapperCol: { offset: 8, span: 16 },
    };
    
    const history = useHistory()

    const onFinish = values => {
        request({
            url: '/web/login',
            method: 'POST',
            params: {
                username:values.username,
                password: values.password
            }
        }).then(res => {
            setToken(res.data.data.token)
            acc.setInfo(res.data.data.account)
            setTimeout(()=> {
                const oldPath = storage.get('lastPath')
                if (!isEmpty(oldPath)) {
                  storage.remove('lastPath')
                  history.push(oldPath)
                } else {
                    history.push('/ui/dashboard')
                }
            },200)
        })
       
    };

    const onFinishFailed = () => {
        // console.log('Failed:', errorInfo);
    };

    return (
        <div className="login">
        <div className="rectangle">
        <Form
            {...layout}
            name="basic"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
        >
            <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please input your username!' }]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
            >
                <Input.Password />
            </Form.Item>


            <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                    Submit
              </Button>
            </Form.Item>
        </Form>
        </div>
        </div>
    );
}


const Login = inject('account')(observer(FormBox))

export default Login