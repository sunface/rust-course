import React from 'react'
import { Icon } from 'antd'
import { inject, observer } from 'mobx-react'
import style from './index.module.less'
const Languages = inject('system')(observer((props) =>{
    let {system} = props
    
    const IconFont = Icon.createFromIconfontCN({
        scriptUrl: '//at.alicdn.com/t/font_1585712_tvew52du1cn.js'
    })

    function setLocale(locale){
        system.setLocale(locale)
    }
    return (
        <>
            <div className={style.languages}>
                <div onClick={()=>{setLocale('en_GB')}}>
                    <IconFont type="icon-yingguo" className={`${style.icon}` } />
                    <div className={`${system.locale === 'en_GB'?style.selected:''}`}></div>
                </div>
                <div onClick={()=>{setLocale('zh_CN')}}>
                    <IconFont type="icon-china" className={`${style.icon}`} />
                    <div className={`${system.locale === 'zh_CN'?style.selected:''}`}></div>
                </div>
            </div>
        </>
    )
}))

export default Languages