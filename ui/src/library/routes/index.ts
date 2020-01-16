import React from 'react'
import Element from '../routes/modules/Element'

const Dashboard = React.lazy(() => import('../../pages/Index/Dashboard'))
const Charts = React.lazy(() => import('../../pages/Index/Charts'))

export type Router = {
    path: string,
    title: string,
    icon: string,
    component?: any,
    children?:any
}
const Routers:Router[] = [
    {
        path: '/home/dashboard',
        title: 'dashboard',
        icon: 'dashboard',
        component: Dashboard
    },
    {
        path: '/home/charts',
        title: 'chart',
        icon: 'pie-chart',
        component: Charts
    },
    {
        path: '/home/element',
        title: 'element',
        icon: 'build',
        children: Element
    }
]

export default Routers