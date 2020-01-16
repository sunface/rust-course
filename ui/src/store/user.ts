import { action, observable } from 'mobx'

export interface IUser  {
    address: string,
    email: string,
    tel: string,
    avatar: string,
    setInfo?: any,
}
class User{
    @observable address = ''
    @observable email = ''
    @observable tel= ''
    @observable avatar = ''


    @action 
    setInfo = (info:IUser) => {
        this.address = info.address
        this.email = info.email
        this.tel = info.tel
        this.avatar = info.avatar
    }
}

export let user = new User()