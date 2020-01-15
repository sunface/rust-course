import React, {useState} from 'react'
import { Button, Form, Input, Icon, message, Spin } from 'antd'
import { useHistory} from 'react-router-dom'
import style from './index.module.less'
import { post } from '@http/index'
import { setToken } from '@utils/auth'
import storage from '@utils/localStorage'
import { inject, observer } from 'mobx-react'

function FormBox(props) {
    let { user } = props
    let history = useHistory()
    const [btnLoading, setBtnLoading] = useState(false)
    const { getFieldDecorator } = props.form
    function handleSubmit(e){
        e.preventDefault()
        props.form.validateFields((err, values) => {
            setBtnLoading(true)
            post('/api/login', 
                {
                    username:'admin', 
                    password: '123456'
                },
                function(res){
                    if(res.err === 1){
                        message.error(res.msg)
                    }else{
                        setToken(res.data.token)
                        delete res.data.token
                        storage.set('info', res.data)
                        props.setloading(true)
                        user.setInfo(res.data)
                        setTimeout(() => {
                            props.setloading(false)
                            history.push('/home/dashboard')
                        }, 2000)
                    }
                },
                function(err){
                    console.log(err)
                    message.error('ds')
                },
                function(){
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
                <Form.Item labelAlign='right' labelCol={{span: 3, offset: 12}}>
                    <Button onClick={handleSubmit} type="primary" shape="round" loading={btnLoading?true:false}>
                        登录
                    </Button>
                </Form.Item>
            </Form>
        </div>
    )
}
const FormBoxWrapper = Form.create({ name: 'normal_login' })(inject('user')(observer(FormBox)))

let Login = inject('user')(observer(() => {
    const [loading, setloading] = useState(false)
    //npm install --save rc-form-hooks
    // https://www.jianshu.com/p/fc59cb61f7cc
    return (
        <div className={style.app}>
            <Spin spinning={loading}>
                <div className={style.rectangle}>
                    <FormBoxWrapper setloading={setloading}/>
                </div>
            </Spin>
        </div>
    )
}))

export default Login