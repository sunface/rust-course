import React, { useEffect } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Menu, Layout } from 'antd'
import { inject, observer } from 'mobx-react'
import './index.less'
import { FormattedMessage as Message } from 'react-intl'
import { GlobalOutlined, UserOutlined } from '@ant-design/icons';
import { isEmpty } from '../../library/utils/validate'
import { logout } from '../../library/utils/account';
import { createFromIconfontCN } from '@ant-design/icons';
import darkVars from '../../styles/dark.json';
import lightVars from '../../styles/light.json';

const { Sider } = Layout

const { SubMenu } = Menu
const SiderWrapper = inject('system')(observer(props => {
    const { system, routers } = props
    useEffect(() => {
        let vars = system.theme === "light" ? lightVars : darkVars;
        vars = { ...vars, '@white': '#fff', '@black': '#000' };
        window.less.modifyVars(vars) 
    },[system.theme])


    const location = useLocation()
    const MyIcon = createFromIconfontCN({
        scriptUrl: '//at.alicdn.com/t/font_1402269_m6v7u5uwb2.js',
    });
    return (
        <Sider collapsed={system.collapsed} className="sider" style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
        }}>
            <div>
                <div className="logo" />
                <Menu
                    mode={`${system.collapsed ? 'vertical' : 'inline'}`}
                    selectedKeys={[location.pathname]}
                    forceSubMenuRender="true"
                    className="sider-menu"
                    theme="dark"
                >
                    {
                        routers.map(route => {
                            if (isEmpty(route.children)) {
                                return (
                                    <Menu.Item key={`${route.path}`}>
                                        <Link to={route.path}>

                                            <route.icon />
                                            <span><Message id={route.title} /></span>
                                        </Link>
                                    </Menu.Item>
                                )
                            }
                            const items = []
                            route.children.map(r => {
                                if (r.inMenu !== false) {
                                    items.push(
                                        <Menu.Item key={r.path}>
                                            <Link to={r.path}>
                                                {
                                                    // isEmpty(r.icon) ? '' : <r.icon />
                                                }
                                                <span><Message id={r.title} /></span>
                                            </Link>
                                        </Menu.Item>
                                    )
                                }
                                return ''
                            })
                            return (
                                <SubMenu key={`${route.path}`} title={
                                    <span>
                                        <route.icon />
                                        <span><Message id={route.title} /></span>
                                    </span>
                                }>
                                    {items}
                                </SubMenu>
                            )
                        })
                    }

                    <Menu.Item key="set-locale1" style={{ position: 'absolute', bottom: '95px', right: '32px' }}>
                        {
                            system.theme === 'light' ?
                                <MyIcon type="icon-moon" onClick={() => {
                                    system.setTheme('dark')
               
                                }} /> :
                                <MyIcon type="icon-sun" onClick={() => {
                                    system.setTheme('light')
                                }} style={{ fontSize: '18px' }} />
                        }

                        <span><Message id='changeTheme' /></span>
                    </Menu.Item>
                    <Menu.Item key="set-locale" style={{ position: 'absolute', bottom: '55px', right: '32px', fontSize: '16px' }}>
                        <GlobalOutlined onClick={() => { system.setLocale() }} />
                        <span><Message id='languages' /></span>
                    </Menu.Item>
                    <SubMenu key="user-setting" icon={<UserOutlined />} style={{ position: 'absolute', bottom: '20px', right: '0px', fontSize: '16px' }}>
                        <Menu.Item key="logout" onClick={logout}>Logout</Menu.Item>
                    </SubMenu>
                </Menu>

            </div>
        </Sider>
    )
}))

export default SiderWrapper