import React from 'react'
import {SearchOutlined} from '@ant-design/icons';
  
const TraceSearch = React.lazy(() => import('../../pages/TraceSearch'))
// const TracePage = React.lazy(() => import('../../pages/TracePage'))
  
const Trace = [
    {
        path: '/ui/trace/search',
        title: 'traceSearch',
        icon: SearchOutlined,
        component: TraceSearch
    },
    // {
    //     path: '/ui/trace/detail/:id',
    //     title: 'traceDetail',
    //     icon: SearchOutlined,
    //     component: TracePage,
    //     inMenu: false
    // }
]
export default Trace