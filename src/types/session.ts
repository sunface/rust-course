import { Tag } from './tag'
export interface Session {
    token: string
    createTime: string
    user: User
}

export interface User {
    // basic info
    id: number
    username: string
    nickname: string
    avatar: string
    role?: string
    email?: string

    // about user
    tagline?: string
    cover?: string
    location?: string
    availFor?: string
    about?: string
    rawSkills?: Tag[]
    skills?: number[]

    // social links
    website?: string
    twitter?: string
    github?: string
    zhihu?: string
    weibo?: string
    facebook?: string
    stackoverflow?: string

    lastSeenAt?: string
    created?: string
}

export interface UserSimple {
    id: number
    username: string
    nickname: string
    avatar: string
}