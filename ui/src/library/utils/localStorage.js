let adminKey = 'admin-'
const storage = {
    set(key, value){
        localStorage.setItem(adminKey+key, JSON.stringify(value))
    },
    get(key){
        return JSON.parse(localStorage.getItem(adminKey+key))
    },
    remove(key){
        localStorage.removeItem(adminKey+key)
    }
}
export default storage