import React, { Suspense, useState, useEffect } from 'react'
import { Layout, BackTop } from 'antd'
import BreadcrumbWrapper from '../Breadcrumb'
import { Route } from 'react-router-dom'
import { isEmpty } from '../../library/utils/validate'
const { Content } = Layout
// import {
//     TransitionGroup,
//     CSSTransition
//   } from "react-transition-group";
function ContentWrapper(porps){
    let { routers } = porps
    let [routeItem, setRouteItem] = useState([])
    
    useEffect( () => {
        let item = []
        routers.map((route) => {
            if(!isEmpty(route.children)){
                route.children.map((r) => {
                    item.push(r)
                    return ''
                })
            }else{
                item.push(route)
            }
            return ''
        })
        setRouteItem(item)
        return ()=>{
            setRouteItem([])
        }
    }, [routers])
    return(
        <>
            <Content>
                <Suspense fallback={<div></div>}>
                    <BreadcrumbWrapper />
                    {
                        routeItem.map((route, key) => {
                            return(
                                <Route key={`${key}`} path={route.path} component={route.component}/>
                            )
                        })
                    }
                    {/* <Route path="/home/*" component={Error404} /> */}
                </Suspense>
                <BackTop />
            </Content>
        </>
    )
}

export default ContentWrapper