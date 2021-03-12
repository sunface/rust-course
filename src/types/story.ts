import { UserSimple} from './user'
import { Tag } from './tag';


export enum StoryStatus {
    Draft = 1,
    Published = 2,
    Hiddent = 3 
}

export interface Story {
    id?: string 
    type?: string
    slug?: string 
    creator?: UserSimple
    creatorId?: string
    title?: string 
    md?: string
    url?: string 
    cover?: string 
    brief?: string 
    created?: string
    tags?: string[]
    rawTags?: Tag[]
    likes? : number
    liked? : boolean
    pinned?: boolean
    comments? : number
    bookmarked?: boolean
    status?: number
}