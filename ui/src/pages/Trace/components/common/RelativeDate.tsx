// Copyright (c) 2017 Uber Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import moment from 'moment';

import { formatRelativeDate } from '../../utils/date';

type Props = {
  fullMonthName: boolean | undefined | null;
  includeTime: boolean | undefined | null;
  value: number | Date | any;
};

// TODO typescript doesn't understand text or null as react nodes
// https://github.com/Microsoft/TypeScript/issues/21699
export default function RelativeDate(props: Props): any {
  const { value, includeTime, fullMonthName } = props;
  const m = moment.isMoment(value) ? value : moment(value);
  const dateStr = formatRelativeDate(m, Boolean(fullMonthName));
  const timeStr = includeTime ? `, ${m.format('h:mm:ss a')}` : '';
  return `${dateStr}${timeStr}`;
}
