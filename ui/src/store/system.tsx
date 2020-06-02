import { observable, action } from 'mobx'
import storage from '../library/utils/localStorage'
import moment from 'moment';

export interface ISystem {
    dark: boolean,
    collapsed: boolean,
    drawer: boolean,
    mode: string,
    theme: string,
    primary: string,
    locale: string,
    lang: string,

    // selected date in DatePicker
    startDate: string,
    endDate:string,

    setTheme?:any,
    setCollapsed?:any,
    setDrawer?:any,
    setPrimary?:any,
    setLocale?:any,
    setLang?:any,
    setStartDate?:any,
    setEndDate?:any
}
class System{
    // constructor() {
        
    // }
    @observable dark = false
    @observable collapsed = true
    @observable drawer = false
    @observable mode = 'inline'
    @observable theme = storage.get('apm-theme') || 'light'
    @observable primary = '#2196f3'
    @observable locale = 'zh_CN'
    @observable lang = 'zh'
    @observable startDate = storage.get('apm-start-date') || moment().subtract(1, 'h')
    @observable endDate = storage.get('apm-end-date') ||  moment()

    @action
    setTheme = (theme) => {
            this.theme = theme
            storage.set('apm-theme',theme)
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
    setLocale = () => {
        this.locale = this.locale==='en_US'?'zh_CN':'en_US'
    }
    @action
    setLang = (lang:string) => {
        this.lang = lang
    }

    @action
    setStartDate = (date:string) => {
        this.startDate = date
        storage.set('apm-start-date',date)
    }
    @action
    setEndDate = (date:string) => {
        this.endDate = date
        storage.set('apm-end-date',date)
    }
}

export let system = new System()