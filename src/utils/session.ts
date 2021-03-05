import { removeToken } from "./axios/getToken"
import { requestApi } from "./axios/request"
import events from "./events"

export const logout = async () => {
    await requestApi.post("/user/logout")
    removeToken()
    events.emit('set-session', null)
  }
