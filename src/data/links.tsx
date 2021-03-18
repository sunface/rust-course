import { getSvgIcon } from 'components/svg-icon'
import React from 'react'
import { FaFileAlt, FaScroll, FaBookOpen, FaTags, FaUserCircle, FaRegFile, FaUser, FaRegUser, FaUserFriends } from 'react-icons/fa'
import { Route } from 'src/types/route'
import { SearchFilter } from 'src/types/search'
import { ReserveUrls } from './reserve-urls'
export const editorLinks: Route[] = [{
    title: '文章',
    path: `${ReserveUrls.Editor}/posts`,
    icon: getSvgIcon("post"),
    disabled: false
},
{
    title: '草稿',
    path: `${ReserveUrls.Editor}/drafts`,
    icon: getSvgIcon("drafts"),
    disabled: false
},
{
    title: '系列',
    path: `${ReserveUrls.Editor}/series`,
    icon: getSvgIcon("series"),
    disabled: false
}
]

export const interactionLinks: any[] = [
    {
        title: 'Following tags',
        path: `${ReserveUrls.Interaction}/following-tags`,
        disabled: false
    },
    {
        title: 'Following users',
        path: `${ReserveUrls.Interaction}/following-users`,
        disabled: false
    },
    {
        title: 'Followers',
        path: `${ReserveUrls.Interaction}/followers`,
        disabled: false
    },
]

export const searchLinks: any[] = [{
    title: '文章',
    path: `${ReserveUrls.Search}/posts`,
    icon: getSvgIcon("post"),
    disabled: false,
    filters: [SearchFilter.Favorites,SearchFilter.Recent]
},
{
    title: '用户',
    path: `${ReserveUrls.Search}/users`,
    icon: getSvgIcon('user','1.5rem'),
    disabled: false,
    filters: [SearchFilter.Favorites]
}
]

export const adminLinks: Route[] = [{
    title: '标签管理',
    path: `${ReserveUrls.Admin}/tags`,
    icon: getSvgIcon("tags"),
    disabled: false
},
{
    title: '菜单管理',
    path: `${ReserveUrls.Admin}/navbar`,
    icon: getSvgIcon("navbar"),
    disabled: false
},
{
    title: '用户管理',
    path: `${ReserveUrls.Admin}/users`,
    icon: getSvgIcon("user"),
    disabled: false
},
]


export const settingLinks: Route[] = [{
    title: '用户信息',
    path: `${ReserveUrls.Settings}/profile`,
    icon: <FaUserCircle />,
    disabled: false
},
{
    title: '博客菜单',
    path: `${ReserveUrls.Settings}/navbar`,
    icon: getSvgIcon("navbar"),
    disabled: false
},
{
    title: '组织管理',
    path: `${ReserveUrls.Settings}/orgs`,
    icon: <FaUserFriends />,
    disabled: false
},
]

export const orgSettingLinks: Route[] = [{
    title: '组织信息',
    path: `${ReserveUrls.Settings}/org/profile`,
    icon: <FaUserCircle />,
    disabled: false
},
{
    title: '成员管理',
    path: `${ReserveUrls.Settings}/org/members`,
    icon: <FaUserFriends />,
    disabled: false
},
]



export const navLinks = [{
    title: '主页',
    url: '/',
    baseUrl: '/',
    icon: getSvgIcon("home", "1.4rem")
},
{
    title: '标签',
    url: ReserveUrls.Tags,
    baseUrl: ReserveUrls.Tags,
    icon: getSvgIcon("tags", "1.2rem")
},
{
    title: 'Search',
    url: `${ReserveUrls.Search}/posts`,
    baseUrl: `${ReserveUrls.Search}`,
    icon: getSvgIcon("search", "1.2rem")
},
]