let adminKey = 'im.dev.'
const storage = {
    set(key:string, value:any){
        localStorage.setItem(adminKey+key, JSON.stringify(value))
    },
    get(key:string){
        return JSON.parse(localStorage.getItem(adminKey+key)!)
    },
    remove(key:string){
        localStorage.removeItem(adminKey+key)
    }
}
 
export default storage