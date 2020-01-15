import React from 'react'
import { Icon } from 'antd'
import style from './index.module.less'
import { inject, observer } from 'mobx-react'

let Logo =  inject('system')(observer((props) => {
    let {system} = props
    return(
        <div className={style.logo}>
            {/* ${display?style.title:style.title_hidden} */}
            <div>
               dsa
            </div>
            <div onClick={()=>{system.setCollapsed()}} className={`${style.icon}  ${system.collapsed?style.icon_transition:''}`}>
                <Icon type="menu-unfold" />
            </div>
        </div>
    )
}))

export default Logo