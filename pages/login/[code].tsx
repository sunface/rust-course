import { useRouter } from "next/router"
import React, { useEffect, useState } from "react"
import { requestApi } from "utils/axios/request"
import { saveToken } from "utils/axios/getToken"
import storage from "utils/localStorage"
import useSession from "hooks/use-session"

const LoginCodePage = () => {
    const {useLogin} = useSession()
    const router = useRouter()
    const code = router.query.code
    useEffect(() => {
        if (code) {
            login(code)
        }
    }, [code])

    const login = async (code) => {
        const res = await requestApi.post("/user/login/code", { code: code })
        if (res.data) {
            //已经注册过
            saveToken(res.data.token)
            useLogin()
            const oldPage = storage.get('current-page')
            if (oldPage) {
                storage.remove('current-page')
                router.push(oldPage)
            } else {
                router.push('/')
            }
        } else {
            // 进入注册流程
            router.push(`/login/onboard?code=${code}`)
        }

    }

    return (
        <>
        </>
    )
}

export default LoginCodePage


