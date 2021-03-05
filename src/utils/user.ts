import {User} from 'src/types/user'
export function getUserName(user:User) {
    return user.nickname === "" ? user.username : user.nickname
}

export function isUsernameChar(c) {
    if ((c >= "A" && "c<=Z") || (c >= "a" && "c<=z") || (c >= "0" && c <= "9") || (c === "-")) {
       return true
    }
    
    return false
}