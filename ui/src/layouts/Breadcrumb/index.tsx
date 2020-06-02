import React from 'react'
import { useLocation } from 'react-router-dom'
import { Breadcrumb } from 'antd'
import { FormattedMessage as Message } from 'react-intl' 

const BreadcrumbWrapper = () =>{
    let location = useLocation()
    let pathname = location.pathname.split('/')
    return (
        <>
            <div>
                <Breadcrumb separator=">">
                    {
                        pathname.map((item, key)=>{
                            if(item.length > 0){
                                return (
                                    <Breadcrumb.Item key={key}><Message id={item}/></Breadcrumb.Item>
                                )
                            }
                            return ''
                        })
                    }
                </Breadcrumb>
            </div>
        </>
    )
}

export default BreadcrumbWrapper