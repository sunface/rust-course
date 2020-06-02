import {ISystem,system} from './system'
import {IAccount,account} from './account'

export interface IStore {
    account: IAccount,
    system: ISystem
} 
export default {
    system, 
    account
}