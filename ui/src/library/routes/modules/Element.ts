import React from 'react'

const Accordion = React.lazy(() => import('../../../pages/Index/Elements/Accordion'))
const Paginations = React.lazy(() => import('../../../pages/Index/Elements/Paginations'))
const DatePickers = React.lazy(() => import('../../../pages/Index/Elements/DatePickers'))
const Icons = React.lazy(() => import('../../../pages/Index/Elements/Icons'))

const Demo = [
    {
        path: '/home/element/accordion',
        title: 'accordion',
        icon: 'pic-center',
        component: Accordion
    },
    {
        path: '/home/element/paginations',
        title: 'paginations',
        icon: 'pic-center',
        component: Paginations
    },
    {
        path: '/home/element/datePickers',
        title: 'datePickers',
        icon: 'calendar',
        component: DatePickers
    },
    {
        path: '/home/element/icons',
        title: 'icons',
        icon: 'smile',
        component: Icons
    }
]
export default Demo