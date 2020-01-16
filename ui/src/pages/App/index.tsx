import React, { useEffect } from 'react'
import {Route, Switch, Redirect} from 'react-router-dom'
import { inject, observer } from 'mobx-react'
import '@/styles/main.less'
import Home from '../../pages/Index'
import Login from '../../pages/Login'
import ConfigProvider from '../../components/ConfigProvider'
import Intl from '../../components/Intl'


let App = inject('system')(observer((props:any) => {
    //npm install --save rc-form-hooks
    // 
    useEffect(() => {
        // console.log("modify vars")
        // alert(1)
        // modifyVars(system.dark, system.primary)
        return () => {}
    })
    return (
        <>
            <Intl>
                <ConfigProvider>
                    <Switch>
                        <Route path="/home" component={Home} />
                        <Route path="/login" exact component={Login} />
                        <Redirect to="/home"/> 
                    </Switch>
                </ConfigProvider>
            </Intl>
            
            
        </>
    )
}))

export default App