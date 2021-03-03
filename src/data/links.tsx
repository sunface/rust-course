import {getSvgIcon } from 'components/svg-icon'
import React from 'react'
import { FaFileAlt, FaScroll, FaBookOpen, FaTags, FaUserCircle, FaRegFile } from 'react-icons/fa'
import { Route } from 'src/types/route'
import { ReserveUrls } from './reserve-urls'
export const editorLinks: Route[] = [{
    title: '文章',
    path: `${ReserveUrls.Editor}/posts`,
    icon: getSvgIcon("post"),
    disabled: false
},
{
    title: '系列',
    path: `${ReserveUrls.Editor}/series`,
    icon: getSvgIcon("series"),
    disabled: false
}
]

export const adminLinks: Route[] = [{
    title: '标签管理',
    path: `${ReserveUrls.Admin}/tags`,
    icon: getSvgIcon("tags"),
    disabled: false
}]


export const settingLinks: Route[] = [{
    title: '用户设置',
    path: `${ReserveUrls.Settings}/profile`,
    icon: <FaUserCircle />,
    disabled: false
}]