import _round from 'lodash/round';

import moment from 'moment';

export const ONE_MILLISECOND = 1000;

const TODAY = 'Today';
const YESTERDAY = 'Yesterday';
export const STANDARD_DATE_FORMAT = 'YYYY-MM-DD';
export const STANDARD_DATETIME_FORMAT = 'MMMM D YYYY, HH:mm:ss.SSS';
/**
 * Humanizes the duration based on the inputUnit
 *
 * Example:
 * 5000ms => 5s
 * 1000μs => 1ms
 */
export function formatDuration(duration: number, inputUnit: string = 'microseconds'): string {
    let d = duration;
    if (inputUnit === 'microseconds') {
      d = duration / 1000;
    }
    let units = 'ms';
    if (d >= 1000) {
      units = 's';
      d /= 1000;
    }
    return _round(d, 2) + units;
  }
  
  export function formatRelativeDate(value: any, fullMonthName: boolean = false) {
    const m = moment.isMoment(value) ? value : moment(value);
    const monthFormat = fullMonthName ? 'MMMM' : 'MMM';
    const dt = new Date();
    if (dt.getFullYear() !== m.year()) {
      return m.format(`${monthFormat} D, YYYY`);
    }
    const mMonth = m.month();
    const mDate = m.date();
    const date = dt.getDate();
    if (mMonth === dt.getMonth() && mDate === date) {
      return TODAY;
    }
    dt.setDate(date - 1);
    if (mMonth === dt.getMonth() && mDate === dt.getDate()) {
      return YESTERDAY;
    }
    return m.format(`${monthFormat} D`);
  }

  /**
 * @param {number} timestamp
 * @param {number} initialTimestamp
 * @param {number} totalDuration
 * @return {number} 0-100 percentage
 */
export function getPercentageOfDuration(duration: number, totalDuration: number) {
    return (duration / totalDuration) * 100;
  }

  export function formatDate(duration: number) {
    return moment(duration / ONE_MILLISECOND).format(STANDARD_DATE_FORMAT);
  }
  
  export function formatDatetime(duration: number) {
    return moment(duration / ONE_MILLISECOND).format(STANDARD_DATETIME_FORMAT);
  }