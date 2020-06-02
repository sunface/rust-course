import { action, observable } from 'mobx'
import storage from '../library/utils/localStorage'
export interface IAccount  {
    info:any,
    setInfo: any
} 
class Account{
    @observable info = storage.get("apm-account-info") 
    @action 
    setInfo = (info:any) => {
        this.info = info
        storage.set("apm-account-info",info)
    }
}
  
export let account = new Account()