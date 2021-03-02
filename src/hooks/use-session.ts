import { useEffect, useState } from "react"
import { Session } from "src/types/session"
import { requestApi } from "utils/axios/request"
import events from "utils/events"
import storage from "utils/localStorage"

function useSession(): Session{
  const [session, setSession] = useState(null)
  useEffect(() => {
    const sess = storage.get('session')
    if (sess) {
      setSession(sess)
      // 页面重新进入时，跟服务器端进行信息同步
      requestApi.get(`/session`).then(res => {
        setSession(res.data)
      })
    }

    events.on('set-session',storeSession)

    return() =>  {
      events.off('set-session',storeSession)
    }
  }, [])


  const storeSession = (sess: Session) => {
    sess ? storage.set('session', sess) : storage.remove('session')
    setSession(sess)
  }

  return session
}

export default useSession
