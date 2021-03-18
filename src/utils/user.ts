import { config } from 'configs/config'
import {User} from 'src/types/user'
import { requestApi } from './axios/request'
var validator = require('validator');

export function getUserName(user:User) {
    return user.nickname === "" ? user.username : user.nickname
}

export function isUsernameChar(c) {
    if ((c >= "A" && "c<=Z") || (c >= "a" && "c<=z") || (c >= "0" && c <= "9") || (c === "-")) {
       return true
    }
    
    return false
}

export const usernameInvalidTips = "May only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen."


export const  validateUsername = async value => {
    let error
    if (!value?.trim()) {
        return "不能为空"
    }

    if (value?.length > config.user.usernameMaxLen) {
       return `长度不能超过${config.user.usernameMaxLen}`
    }

    for (const c of value) {
        if (!isUsernameChar(c)) {
            return usernameInvalidTips
        }
    }

    const res = await requestApi.get(`/user/name/exist/${value}`)
    if (res.data) {
        return `The name '${value}' is already taken.`
    }
    return error
}

export function validateNickname(value) {
    let error
    if (!value?.trim()) {
        error = "不能为空"
    }

    if (value?.length > config.user.usernameMaxLen) {
        error = `长度不能超过${config.user.usernameMaxLen}`
    }

    return error
}

export async function validateEmail(value) {
    let email = value?.trim()
    if (!email) {
        return "邮箱不能为空"
    }

    if (email?.length > config.user.usernameMaxLen) {
       return `长度不能超过${config.user.usernameMaxLen}`
    }

    if (email) {
        if (!validator.isEmail(email)) {
            return  "Email格式不合法"
        }
    }

    const res = await requestApi.get(`/user/email/exist/${value}`)
    if (res.data) {
        return `The email '${value}' is already taken.`
    }
}


export function validateUrl(value, canBeEmpty = true) {
    let url = value?.trim()
    let error
    if (!canBeEmpty) {
        if (!url) {
            error = "url不能为空"
            return error
        }
    }

    if (url) {
        if (!validator.isURL(value)) {
            error = "URL格式不合法"
            return error
        }
    }

    return error
}