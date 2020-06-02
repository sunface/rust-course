// Copyright (c) 2019 Uber Technologies, Inc.
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
import cx from 'classnames';
import IoIosArrowDown from 'react-icons/lib/io/ios-arrow-down';
import IoIosArrowRight from 'react-icons/lib/io/ios-arrow-right';
import TextList from './TextList';
import { TNil } from '../../../../types';

import './AccordianText.css';

type AccordianTextProps = {
  className?: string | TNil;
  data: string[];
  headerClassName?: string | TNil;
  highContrast?: boolean;
  interactive?: boolean;
  isOpen: boolean;
  label: React.ReactNode;
  onToggle?: null | (() => void);
};

export default function AccordianText(props: AccordianTextProps) {
  const { className, data, headerClassName, highContrast, interactive, isOpen, label, onToggle } = props;
  const isEmpty = !Array.isArray(data) || !data.length;
  const iconCls = cx('u-align-icon', { 'AccordianKeyValues--emptyIcon': isEmpty });
  let arrow: React.ReactNode | null = null;
  let headerProps: Object | null = null;
  if (interactive) {
    arrow = isOpen ? <IoIosArrowDown className={iconCls} /> : <IoIosArrowRight className={iconCls} />;
    headerProps = {
      'aria-checked': isOpen,
      onClick: isEmpty ? null : onToggle,
      role: 'switch',
    };
  }
  return (
    <div className={className || ''}>
      <div
        className={cx('AccordianText--header', headerClassName, {
          'is-empty': isEmpty,
          'is-high-contrast': highContrast,
          'is-open': isOpen,
        })}
        {...headerProps}
      >
        {arrow} <strong>{label}</strong> ({data.length})
      </div>
      {isOpen && <TextList data={data} />}
    </div>
  );
}

AccordianText.defaultProps = {
  className: null,
  highContrast: false,
  interactive: true,
  onToggle: null,
};
