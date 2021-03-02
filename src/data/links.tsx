import React from 'react'
import { FaFileAlt, FaScroll, FaBookOpen, FaTags, FaUserCircle } from 'react-icons/fa'
import { Route } from 'src/types/route'
import { ReserveUrls } from './reserve-urls'
export const editorLinks: Route[] = [{
    title: '文章',
    path: `${ReserveUrls.Editor}/posts`,
    icon: <FaFileAlt />,
    disabled: false
},
{
    title: '系列',
    path: `${ReserveUrls.Editor}/series`,
    icon: <FaBookOpen />,
    disabled: false
},
{
    title: '课程',
    path: `${ReserveUrls.Editor}/course`,
    icon: <FaScroll />,
    disabled: false
}
]

export const adminLinks: Route[] = [{
    title: '标签管理',
    path: `${ReserveUrls.Admin}/tags`,
    icon: <FaTags />,
    disabled: false
}]


export const settingLinks: Route[] = [{
    title: '用户设置',
    path: `${ReserveUrls.Settings}/profile`,
    icon: <FaUserCircle />,
    disabled: false
}]