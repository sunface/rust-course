import React from 'react'
import Element from '@library/routes/modules/Element'

const Dashboard = React.lazy(() => import('@pages/Index/Dashboard'))
const Charts = React.lazy(() => import('@pages/Index/Charts'))

const Routers = [
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