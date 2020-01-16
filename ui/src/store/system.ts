import { observable, action } from 'mobx'

export interface ISystem {
    dark: boolean,
    collapsed: boolean,
    drawer: boolean,
    mode: string,
    theme: string,
    primary: string,
    locale: string,
    lang: string,

    setDark?:any,
    setCollapsed?:any,
    setDrawer?:any,
    setPrimary?:any,
    setLocale?:any,
    setLang?:any
}
class System{
    // constructor() {
        
    // }
    @observable dark = false
    @observable collapsed = false
    @observable drawer = false
    @observable mode = 'inline'
    @observable theme = 'light'
    @observable primary = '#2196f3'
    @observable locale = 'zh_CN'
    @observable lang = 'zh'

    @action
    setDark = () => {
        this.dark = !this.dark
        if(this.dark){
            this.theme = 'dark'
        }else{
            this.theme = 'light'
        }
    }
    @action
    setCollapsed = () => {
        this.collapsed = !this.collapsed
    }
    @action
    setDrawer = () => {
        this.drawer = !this.drawer
    }
    @action
    setPrimary = (color:string) => {
        this.primary = color
    }
    @action
    setLocale = (locale:string) => {
        this.locale = locale
    }
    @action
    setLang = (lang:string) => {
        this.lang = lang
    }
}

export let system = new System()
