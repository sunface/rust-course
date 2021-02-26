import {User} from 'src/types/session'
export function getUserName(user:User) {
    return user.nickname === "" ? user.username : user.nickname
}