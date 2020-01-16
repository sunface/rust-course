import React from 'react'
import { Layout, Icon, Badge, Avatar, Popover } from 'antd'
import { useHistory } from 'react-router-dom'
import { inject, observer } from 'mobx-react'
import { removeToken } from '../../library/utils/auth'
import style from './index.module.less'
import {IUser} from '../../store/user'
import {ISystem} from '../../store/system'
import {isMobile} from '../../pages/Responsive'

const { Header } = Layout

const HeaderWrapper = inject('system', 'user')(observer((props:{user:IUser,system:ISystem} & any) =>{
    let history = useHistory()
    let {system, user}:{system:ISystem,user:IUser} = props
    
    const onClickLogout = ()=>{
        removeToken()
        history.push('/login')
    }
    const userPopover = (
        <div className={style.userPopover}>
            <div onClick={onClickLogout}><Icon type="logout" /><span>退出</span></div>
        </div>
    )
    const messagePopover = (
        <div className={style.messagePopover}>
            <div>ss</div>
        </div>
    )
    return (
        <>
            <Header>
                {
                    isMobile() ? 
                        <>dsa</>
                        :
                        <div className={style.header}>
                            <div>
                                <Icon type={system.collapsed?'menu-unfold':'menu-fold'} className={style.menu_icon} onClick={()=>{system.setCollapsed()}} />
                            </div>
                            <div> 
                                <div>
                                    {/* <AutoComplete
                                        className="certain-category-search"
                                        dropdownClassName="certain-category-search-dropdown"
                                        dropdownMatchSelectWidth={false}
                                        dropdownStyle={{ width: 300 }}
                                        size="large"
                                        style={{ width: '100%' }}
                                        placeholder="input here"
                                        optionLabelProp="value"
                                    >
                                        <Input suffix={<Icon type="search" className={`${style.icon}`} />} />
                                    </AutoComplete> */}
                                </div>
                                
                                <div>
                                    <Badge dot>
                                        <Popover placement="bottomRight" content={messagePopover}>
                                            <Icon type="bell" className={style.icon} />
                                        </Popover>
                                    </Badge>
                                </div> 
                                
                                <div>
                                    <Popover className={`${style.pointer}`} placement="bottomRight" content={userPopover}>
                                        <Badge dot>
                                            <Avatar icon="user" src={user.avatar}/>
                                        </Badge>
                                    </Popover>
                                </div>
                                
                                <div>
                                    <Icon type="align-left" className={style.icon} onClick={()=>{system.setDrawer()}} />
                                </div>
                                
                            </div>
                        </div>
                }
            </Header>
        </>
    )
}))

export default HeaderWrapper