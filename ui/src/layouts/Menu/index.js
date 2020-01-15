import React from 'react'
import { useLocation } from 'react-router-dom'
import {  Menu, Icon } from 'antd'
import { Link } from 'react-router-dom'
import { inject, observer } from 'mobx-react'
import { isEmpty } from '@library/utils/validate'
import style from './index.module.less'
import { FormattedMessage as Message } from 'react-intl' 
const { SubMenu } = Menu
const MenuWrapper = inject('system')(observer((props) =>{
    let {system, routers} = props
    let location = useLocation()
    return (
        <>
            <div className={style.menu}>
                <div className={style.logo}>
                </div>
                <Menu
                    mode={`${system.collapsed ? 'vertical' : 'inline'}`} 
                    theme={`${system.theme}`}
                    selectedKeys={[location.pathname]}
                    forceSubMenuRender={true}
                >
                    {   
                        routers.map((route) => {
                            if(isEmpty(route.children)){
                                return (
                                    <Menu.Item key={`${route.path}`}>
                                        <Link to={route.path}>
                                            <Icon type={route.icon}/>
                                            <span><Message id={route.title}/></span>
                                        </Link>
                                    </Menu.Item>
                                )
                            }else{
                                let items = []
                                route.children.map((r) => {
                                    items.push(
                                        <Menu.Item key={r.path}>
                                            <Link to={r.path}>
                                                {
                                                    isEmpty(r.icon)?'':<Icon type={r.icon}/>
                                                }
                                                <span><Message id={r.title}/></span>
                                            </Link>
                                        </Menu.Item>
                                    )
                                    return ''
                                })
                                return (
                                    <SubMenu key={`${route.path}`} title={
                                        <span>
                                            <Icon type={route.icon} />
                                            <span><Message id={route.title}/></span>
                                        </span>
                                    }>
                                        {items}
                                    </SubMenu>
                                )
                            }
                        })
                    }
                </Menu>
            
            </div>
        </>
    )
}))

export default MenuWrapper