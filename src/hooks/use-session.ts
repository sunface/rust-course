import { useEffect, useState } from "react"
import { Session } from "src/types/session"
import storage from "utils/localStorage"

function useSession(): [Session, any] {
  const [session, setSession] = useState(null)
  useEffect(() => {
    const sess = storage.get('session')
    if (sess) {
      setSession(sess)
    }
  }, [])


  const storeSession = (sess: Session) => {
    sess ? storage.set('session', sess) : storage.remove('session')
    setSession(sess)
  }

  return [session, storeSession]
}

export default useSession
