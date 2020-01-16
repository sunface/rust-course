import React from 'react'
const A = React.lazy(() => import('../../../pages/Index/Demo/A'))
const B = React.lazy(() => import('../../../pages/Index/Demo/B'))

const Demo = [
    {
        path: '/a',
        title: 'A',
        icon: 'bar-chart',
        component: A
    },
    {
        path: '/b',
        title: 'B',
        icon: 'bar-chart',
        component: B
    }
]
export default Demo