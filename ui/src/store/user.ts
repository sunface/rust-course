import { action, observable } from 'mobx'

type UserInfo = {
    address: string,
    email: string,
    tel: string,
    avatar: string
}
class User{
    @observable info:UserInfo = {address:'',email:'',tel:'',avatar:''}

    @action 
    setInfo = (info:UserInfo) => {
        this.info = info
    }
}
  
export default new User()