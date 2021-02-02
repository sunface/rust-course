import { useEffect, useState } from "react"

const useLogin= () => {
  const [login,setLogin] = useState(null)
  return [login,setLogin]
}

export default useLogin
