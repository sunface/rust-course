import { useEffect, useState } from "react"
import { requestApi } from "utils/axios/request"
import useSWR from 'swr'

export  const useSession = () => {
  const [session,setSession] = useState(null)
  const { data, revalidate } = useSWR(
      '/user/session', 
      () =>
        requestApi.get(`/user/session`).then(res => {
          return res.data
        }),
      {dedupingInterval: 60000}
  )
  
  useEffect(() => {
    setSession(data)
  },[data])
  
  const useLogin = async () => {
      revalidate()
  }

  const logout = async () => {
    await requestApi.post("/user/logout")
    setSession(null)
  }

  return {session,useLogin,logout}
}


export default useSession