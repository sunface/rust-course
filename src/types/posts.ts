import { UserSimple} from './session'
import { Tag } from './tag';

export enum PostFilter {
    Best = "best",
    Featured = "featured",
    Recent = "recent"
}

export interface Post {
    id?: string 
    slug?: string 
    creator?: UserSimple
    creatorId?: number
    title?: string 
    md?: string
    url?: string 
    cover?: string 
    brief?: string 
    created?: string
    tags?: number[]
    rawTags?: Tag[]
    likes? : number
    liked? : boolean
    comments? : number
    bookmarked?: boolean
}