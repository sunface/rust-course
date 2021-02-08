import { requestApi } from "./axios/request"

export let config = {
    posts: {
        titleMaxLen: 128,
        briefMaxLen: 128,
        writingEnabled: false
    }
}

export function initUIConfig() {
    requestApi.get("/uiconfig").then((res) => {
        console.log("初始化UI config:", res.data)
        config = res.data
    })}