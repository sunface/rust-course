import { useEffect, useState } from "react"
import { Session } from "src/types/user"
import { requestApi } from "utils/axios/request"
import events from "utils/events"
import storage from "utils/localStorage"

function useSession(): Session{
  const [session, setSession] = useState(null)
  useEffect(() => {
    const sess = storage.get('session')
    if (sess) {
      setSession(sess)
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
