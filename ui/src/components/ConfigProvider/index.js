import React from 'react'
import { ConfigProvider } from 'antd'
import { inject, observer } from 'mobx-react'
import zhCN from 'antd/es/locale/zh_CN'
import enGB from 'antd/es/locale/en_GB'

const Config = inject('system')(observer((props) =>{
    let {system} = props
    let antdLocale = {}
    antdLocale['zh_CN'] = zhCN
    antdLocale['en_GB'] = enGB
    return (
        <>
            <ConfigProvider locale={antdLocale[system.locale]}>
                {props.children}
            </ConfigProvider>
        </>
    )
}))

export default Config