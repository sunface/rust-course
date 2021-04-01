import { UserSimple } from "./user";

export interface Notification {
    type: number
    title: string 
    subTitle: string 
    user: UserSimple
    read: boolean
    storyID: string
    created: string
}

export enum NotificationType {
    Comment = 1,
    Like = 2,
    Mention = 3,
    Publish = 4,
    Follow = 5,
    Reply = 6
}