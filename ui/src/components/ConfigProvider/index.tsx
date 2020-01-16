import React from 'react'
import { ConfigProvider } from 'antd'
import { inject, observer } from 'mobx-react'
import zhCN from 'antd/es/locale/zh_CN'
import enGB from 'antd/es/locale/en_GB'

const Config = inject('system')(observer((props:any) =>{
    let {system} = props
    return (
        <>
            <ConfigProvider locale={system.locale==='zh_CN' ? zhCN : enGB}>
                {props.children}
            </ConfigProvider>
        </>
    )
}))

export default Config