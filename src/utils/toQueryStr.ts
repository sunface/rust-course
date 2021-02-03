/**
 * 序列化url参数
 * ```ts
 * // 示例
 * toQueryStr({ id: 1, name: null, age: 18 })
 * // 输出 id=1&age=18
 * ```
 */
export const toQueryStr = (obj: any) => {
    if (obj) {
      for (const key in obj) {
        if (obj[key] === null || obj[key] === undefined) {
          delete obj[key]
        }
      }
      return new URLSearchParams(obj).toString()
    } else {
      return ''
    }
  }
  