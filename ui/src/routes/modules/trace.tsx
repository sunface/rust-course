import React from 'react'
import {SearchOutlined} from '@ant-design/icons';
  
   
const Test = React.lazy(() => import('../../pages/Test'))
const Trace = [
    {
        path: '/ui/trace/search',
        title: 'traceSearch',
        icon: SearchOutlined,
        component: Test
    }
]
export default Trace 