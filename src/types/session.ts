export interface Session {
    token: string 
    createTime: string 
    user : User
}

export interface User {
    id :number 
    username: string 
    nickname: string 
    avatar: string 
    role?: string 
    email?: string 
    lastSeenAt?: string
    created?: string
}