import {User} from 'src/types/session'
export function getUserName(user:User) {
    return user.nickname === "" ? user.username : user.nickname
}

export function isUsernameChar(c) {
    if ((c >= "a" && "c<=z") || (c >= "0" && c <= "9") || (c === "-")) {
       return true
    }
    
    return false
}