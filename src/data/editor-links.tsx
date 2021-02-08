import React from 'react'
import { FaFileAlt, FaScroll, FaBookOpen } from 'react-icons/fa'
import { Route } from 'src/types/route'
const editorLinks: Route[] = [{
    title: '文章',
    path: '/editor/posts',
    icon: <FaFileAlt />,
    disabled: false
},
{
    title: '系列',
    path: '/editor/series',
    icon: <FaBookOpen />,
    disabled: false
},
{
    title: '课程',
    path: '/editor/course',
    icon: <FaScroll />,
    disabled: false
},
]

export default editorLinks