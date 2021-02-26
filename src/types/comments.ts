import { UserSimple } from "./session";

export interface Comment {
    id: string 
    targetID: string 
    creatorID: number
    creator?: UserSimple
    md: string 
    liked?: boolean
    likes: number 
    replies: Comment[]
    created?: string 
    updated?: string 
}