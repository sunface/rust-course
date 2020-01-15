import React from 'react'
import { Drawer, Row, Switch } from 'antd'
import { inject, observer } from 'mobx-react'
import style from './index.module.less'
import { CirclePicker } from 'react-color'
import { modifyVars } from '@library/utils/modifyVars'
import Languages from '@components/Languages'
import { FormattedMessage as Message } from 'react-intl' 

const DrawerWrapper = inject('system')(observer((props) =>{
    let {system} = props
    let primary = (color)=>{
        system.setPrimary(color.hex)
        modifyVars(system.dark, color.hex)
        // modifyVars({'@primary-color': color.hex})
    }
    let dark = ()=>{
        system.setDark()
        modifyVars(system.dark, system.primary)
    }
    return (
        <>
            <div>
                <Drawer
                    title={<Message id='setting'/>}
                    width={380}
                    onClose={system.setDrawer}
                    visible={system.drawer}
                    bodyStyle={{ paddingBottom: 80 }}
                    className={`${style.drawer} ${system.dark?style.dark:''}`}
                >
                    <Row>
                        <div className={style.row}>
                            <div><Message id='model'/></div>
                            <div><Switch defaultChecked onClick={ dark } /></div>
                        </div>
                        <div className={style.row}>
                            <div><Message id='themes'/></div>
                            <div>
                                <CirclePicker color={system.primary} onChangeComplete={ primary }/>
                            </div>
                        </div>
                        <div className={style.row}>
                            <div><Message id='languages'/></div>
                            <div>
                                <Languages />
                            </div>
                        </div>
                    </Row>
                </Drawer>
            </div>
        </>
    )
}))

export default DrawerWrapper