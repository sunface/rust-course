import {User} from './session'

export interface Post {
    id?: number 
    slug?: string 
    creator?: User 
    creatorId?: number
    title?: string 
    md?: string
    url?: string 
    cover?: string 
    brief?: string 
    created?: string
    tags?: number[]
    likes? : number 
    liked? : boolean
    recommands? : number
}