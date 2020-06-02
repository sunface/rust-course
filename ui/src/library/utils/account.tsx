import {removeToken } from './auth';
import storage from './localStorage'

export function logout() {
    storage.set("lastPath", window.location.pathname+window.location.search)
    removeToken()
    window.location.href="/login"
}
