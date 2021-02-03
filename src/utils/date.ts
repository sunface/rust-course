import moment from 'moment'

import { isNullOrUndefined } from './is'

export const getNowMon = () => moment()
export const getNow = (format = 'YYYY-MM-DD HH:mm:ss') =>
  getNowMon().format(format)

export const formatTimestamp = (timestamp: number, format = 'MM-DD HH:mm') => {
  if (isNullOrUndefined(timestamp)) {
    return '-'
  }
  if (String(timestamp).length === 10) {
    timestamp = timestamp * 1000
  }
  return moment(timestamp).format(format)
}

export const formatSeconds = (seconds: number, split = ':') => {
  if (isNullOrUndefined(seconds) || Number.isNaN(seconds)) {
    return '-'
  }
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(split)
}
