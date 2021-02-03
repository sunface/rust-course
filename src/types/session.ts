export interface Session {
    token: string 
    createTime: string 
    user : User
}

export interface User {
    id :number 
    username: string 
    nickname: string 
    role: string 
    avatar: string 
    email: string 
    lastSeenAt?: string
    created: string
}