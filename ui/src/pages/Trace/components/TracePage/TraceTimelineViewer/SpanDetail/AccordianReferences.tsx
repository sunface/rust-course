// Copyright (c) 2019 The Jaeger Authors.
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
import './AccordianReferences.css';
import { SpanReference } from '../../../../types/trace';
import ReferenceLink from '../../url/ReferenceLink';

type AccordianReferencesProps = {
  data: SpanReference[];
  highContrast?: boolean;
  interactive?: boolean;
  isOpen: boolean;
  onToggle?: null | (() => void);
  focusSpan: (uiFind: string) => void;
};

type ReferenceItemProps = {
  data: SpanReference[];
  focusSpan: (uiFind: string) => void;
};

// export for test
export function References(props: ReferenceItemProps) {
  const { data, focusSpan } = props;

  return (
    <div className="ReferencesList u-simple-scrollbars">
      <ul className="ReferencesList--List">
        {data.map(reference => {
          return (
            <li className="ReferencesList--Item" key={`${reference.spanID}`}>
              <ReferenceLink reference={reference} focusSpan={focusSpan}>
                <span className="ReferencesList--itemContent">
                  {reference.span ? (
                    <span>
                      <span className="span-svc-name">{reference.span.process.serviceName}</span>
                      <small className="endpoint-name">{reference.span.operationName}</small>
                    </span>
                  ) : (
                    <span className="span-svc-name">&lt; span in another trace &gt;</span>
                  )}
                  <small className="SpanReference--debugInfo">
                    <span className="SpanReference--debugLabel" data-label="Reference Type:">
                      {reference.refType}
                    </span>
                    <span className="SpanReference--debugLabel" data-label="SpanID:">
                      {reference.spanID}
                    </span>
                  </small>
                </span>
              </ReferenceLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default class AccordianReferences extends React.PureComponent<AccordianReferencesProps> {
  static defaultProps = {
    highContrast: false,
    interactive: true,
    onToggle: null,
  };

  render() {
    const { data, highContrast, interactive, isOpen, onToggle, focusSpan } = this.props;
    const isEmpty = !Array.isArray(data) || !data.length;
    const iconCls = cx('u-align-icon', { 'AccordianKReferences--emptyIcon': isEmpty });
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
      <div className="AccordianReferences">
        <div
          className={cx('AccordianReferences--header', 'AccordianReferences--header', {
            'is-empty': isEmpty,
            'is-high-contrast': highContrast,
            'is-open': isOpen,
          })}
          {...headerProps}
        >
          {arrow}
          <strong>
            <span className="AccordianReferences--label">References</span>
          </strong>{' '}
          ({data.length})
        </div>
        {isOpen && <References data={data} focusSpan={focusSpan} />}
      </div>
    );
  }
}
