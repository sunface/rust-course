// Copyright (c) 2018 Uber Technologies, Inc.
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

import * as React from 'react';
import { Button, Input } from 'antd';
import cx from 'classnames';
import IoAndroidLocate from 'react-icons/lib/io/android-locate';

import * as markers from './TracePageSearchBar.markers';
import { trackFilter } from '../index.track';
import UiFindInput from '../../common/UiFindInput';
import { TNil } from '../../../types';

import './TracePageSearchBar.css';

type TracePageSearchBarProps = {
  textFilter: string | TNil;
  prevResult: () => void;
  nextResult: () => void;
  clearSearch: () => void;
  focusUiFindMatches: () => void;
  resultCount: number;
  navigable: boolean;
};

export function TracePageSearchBarFn(props: TracePageSearchBarProps & { forwardedRef: React.Ref<Input> }) {
  const {
    clearSearch,
    focusUiFindMatches,
    forwardedRef,
    navigable,
    nextResult,
    prevResult,
    resultCount,
    textFilter,
  } = props;

  const count = textFilter ? <span className="TracePageSearchBar--count">{resultCount}</span> : null;

  const btnClass = cx('TracePageSearchBar--btn', { 'is-disabled': !textFilter });
  const uiFindInputInputProps = {
    'data-test': markers.IN_TRACE_SEARCH,
    className: 'TracePageSearchBar--bar ub-flex-auto',
    name: 'search',
    suffix: count,
  };

  return (
    <div className="TracePageSearchBar">
      {/* style inline because compact overwrites the display */}
      <Input.Group className="ub-justify-end" compact style={{ display: 'flex' }}>
        <UiFindInput
          inputProps={uiFindInputInputProps}
          forwardedRef={forwardedRef}
          trackFindFunction={trackFilter}
        />
        {navigable && (
          <>
            <Button
              className={cx(btnClass, 'TracePageSearchBar--locateBtn')}
              disabled={!textFilter}
              htmlType="button"
              onClick={focusUiFindMatches}
            >
              <IoAndroidLocate />
            </Button>
            <Button
              className={btnClass}
              disabled={!textFilter}
              htmlType="button"
              icon="up"
              onClick={prevResult}
            />
            <Button
              className={btnClass}
              disabled={!textFilter}
              htmlType="button"
              icon="down"
              onClick={nextResult}
            />
          </>
        )}
        <Button
          className={btnClass}
          disabled={!textFilter}
          htmlType="button"
          icon="close"
          onClick={clearSearch}
        />
      </Input.Group>
    </div>
  );
}

export default React.forwardRef((props: TracePageSearchBarProps, ref: React.Ref<Input>) => (
  <TracePageSearchBarFn {...props} forwardedRef={ref} />
));
