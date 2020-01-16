import {ISystem,system} from './system'
import {IUser,user} from './user'

export interface IStore {
    user: IUser,
    system: ISystem
} 
export default {
    system,
    user
}
