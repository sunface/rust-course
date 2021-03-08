import { UserSimple} from './user'
import { Tag } from './tag';



export interface Post {
    id?: string 
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
    comments? : number
    bookmarked?: boolean
}