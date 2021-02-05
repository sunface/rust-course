import {User} from './session'

export interface Article {
    id?: number 
    creator?: User 
    title: string 
    url: string 
    cover: string 
    brief?: string 
    created?: string
}