import React, { useState } from 'react'
import { Button, Form, Input, Icon, message, Spin } from 'antd'
import {WrappedFormUtils} from 'antd/lib/form/Form'
import { useHistory } from 'react-router-dom'
import style from './index.module.less'
import { post } from '../../library/utils/http/index'
import { setToken } from '../../library/utils/auth'
import storage from '../../library/utils/localStorage'
import { inject, observer } from 'mobx-react'
import { IUser } from '../../store/user'
function FormBox(props: { user: IUser, form: WrappedFormUtils }) {
    const [loading, setloading] = useState(false)
    let { user } = props
    let history = useHistory()
    const [btnLoading, setBtnLoading] = useState(false)
    const { getFieldDecorator } = props.form
    function handleSubmit(e: React.FormEvent<HTMLElement>) {
        e.preventDefault()
        props.form.validateFields((err: any, values: any) => {
            setBtnLoading(true)
            post('/api/login',
                {
                    username: 'admin',
                    password: '123456'
                },
                function (res: any) {
                    if (res.err === 1) {
                        message.error(res.msg)
                    } else {
                        setToken(res.data.token)
                        delete res.data.token
                        storage.set('info', res.data)
                        setloading(true)
                        user.setInfo(res.data)
                        setTimeout(() => {
                            setloading(false)
                            history.push('/home/dashboard')
                        }, 2000)
                    }
                },
                function (err: any) {
                    console.log(err)
                    message.error('ds')
                },
                function () {
                    setBtnLoading(false)
                }
            )
            // if (!err) {
            //   history.push("/index");
            // }
        })
    }

    return (
        <div>
            <Spin spinning={loading}>
                <Form className="login-form">
                    <Form.Item>
                        {getFieldDecorator('username', {
                            initialValue: 'dsa',
                            rules: [{ required: true, message: '用户名不能为空' }]
                        })(
                            <Input
                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                placeholder="Username"
                            />
                        )}
                    </Form.Item>
                    <Form.Item>
                        {getFieldDecorator('password', {
                            initialValue: 'dsa',
                            rules: [{ required: true, message: '密码不能为空' }]
                        })(
                            <Input.Password
                                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                                type="password"
                                placeholder="Password"
                            />
                        )}
                    </Form.Item>
                    <Form.Item labelAlign='right' labelCol={{ span: 3, offset: 12 }}>
                        <Button onClick={handleSubmit} type="primary" shape="round" loading={btnLoading ? true : false}>
                            登录
                    </Button>
                    </Form.Item>
                </Form>
            </Spin>
        </div>
    )
}
const FormBoxWrapper = Form.create({ name: 'normal_login' })(inject('user')(observer(FormBox)))

let Login = inject('user')(observer(() => {
    //npm install --save rc-form-hooks
    // https://www.jianshu.com/p/fc59cb61f7cc
    return (
        <div className={style.app}>
            <div className={style.rectangle}>
                <FormBoxWrapper />
            </div>
        </div>
    )
}))

export default Login