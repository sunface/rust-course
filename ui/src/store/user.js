import { action, observable } from 'mobx'

class User{
    @observable info = new Map()

    @action 
    setInfo = (info) => {
        this.info.replace(info)
    }
}
  
export default new User()