import { AxiosResponse } from 'axios'
import { useEffect, useState } from 'react'
import { createStandaloneToast } from "@chakra-ui/react"
const toast = createStandaloneToast()

/**
 * 同构渲染的数据请求方法
 * 用法参考：https://saber2pr.top/#/blog/Nextjs服务端渲染/ssr项目架构注意与优化
 * @param request axios请求方法
 * @param initData 初始占位数据, 默认null
 * @param autoLoad 是否自动请求一次, 默认true
 */
export const useFetch = <T>(
  request: () => Promise<AxiosResponse<T>>,
  initData: T = null,
  autoLoad = true
): [T, boolean, () => Promise<void>] => {
  const [result, setResult] = useState<T>(initData)
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const apiRes = await request()
      setResult(apiRes.data)
    } catch (error) {
      console.log(error)
      toast({
        title: "An error occurred.",
        description: "获取数据失败",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    autoLoad && fetchData()
  }, [autoLoad])

  return [result, loading, fetchData]
}
