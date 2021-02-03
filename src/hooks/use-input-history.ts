import { useEffect, useState } from 'react'


export const InputHistory = {
    max: 5,
    getList(key: string): string[] {
      const list = localStorage.getItem(key)
      if (list) {
        return JSON.parse(list)
      } else {
        return []
      }
    },
    pushItem(key: string, value: any): void {
      const list = InputHistory.getList(key) || []
      list.unshift(value)
      localStorage.setItem(
        key,
        JSON.stringify([...new Set(list)].slice(0, InputHistory.max))
      )
    },
  }

  
/**
 * 输入记录
 * ```ts
 * // 示例
 * const [searchList, setSearchList] = useInputHistory('search_user')
 * ```
 * @param key
 * @param defaultList
 */
export const useInputHistory = (
  key: string,
  defaultList = []
): [string[], (value: string) => void] => {
  const [list, setList] = useState<string[]>([])

  const setDisplayList = (list: string[]) => {
    if (list.length) {
      setList(list)
    } else {
      setList(defaultList)
    }
  }

  const initHistoryList = () => {
    const history = InputHistory.getList(key)
    if (history) {
      setDisplayList(history)
    }
  }

  useEffect(() => {
    initHistoryList()
  }, [key])

  const pushItem = (value: string) => {
    if (value) {
      InputHistory.pushItem(key, value)
      initHistoryList()
    }
  }

  return [list, pushItem]
}
