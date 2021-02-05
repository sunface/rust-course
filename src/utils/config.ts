import { requestApi } from "./axios/request"

export let config = {
    posts: {
        briefMaxLen: 10
    }
}

export function initUIConfig() {
    requestApi.get("/uiconfig").then((res) => {
        console.log("初始化UI config:", res.data)
        config = res.data
    })}