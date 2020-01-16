import React from 'react'
import { ConfigProvider } from 'antd'
import { inject, observer } from 'mobx-react'
import zhCN from 'antd/es/locale/zh_CN'
import enGB from 'antd/es/locale/en_GB'
import {ISystem} from '../../store/system'
const Config = inject('system')(observer((props:{system:ISystem} & any) =>{
    let {system}:{system:ISystem} = props
    return (
        <>
            <ConfigProvider locale={system.locale==='zh_CN' ? zhCN : enGB}>
                {props.children}
            </ConfigProvider>
        </>
    )
}))

export default Config