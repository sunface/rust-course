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

import * as React from 'react';

import { ApiError } from '../../types/api-error';

import './ErrorMessage.css';

type ErrorMessageProps = {
  className?: string;
  detailClassName?: string;
  messageClassName?: string;
  error: ApiError;
};

type SubPartProps = {
  className?: string;
  error: ApiError;
  wrap?: boolean;
  wrapperClassName?: string;
};

function ErrorAttr({ name, value }: { name: string; value: any }) {
  return (
    <tr className="ErrorMessage--detailItem">
      <td className="ErrorMessage--attr">{name}</td>
      <td className="ErrorMessage--value">{value}</td>
    </tr>
  );
}

function Message(props: SubPartProps) {
  const { className, error, wrap, wrapperClassName } = props;
  const cssClass = `ErrorMessage--msg ${className || ''}`;
  const msg =
    typeof error === 'string' ? (
      <h3 className={cssClass}>{error}</h3>
    ) : (
      <h3 className={cssClass}>{error.message}</h3>
    );
  if (wrap) {
    return <div className={`ErrorMessage ${wrapperClassName || ''}`}>{msg}</div>;
  }
  return msg;
}

Message.defaultProps = {
  className: undefined,
  wrap: false,
  wrapperClassName: undefined,
};

function Details(props: SubPartProps) {
  const { className, error, wrap, wrapperClassName } = props;
  if (typeof error === 'string') {
    return null;
  }
  const { httpStatus, httpStatusText, httpUrl, httpQuery, httpBody } = error;
  const bodyExcerpt = httpBody && httpBody.length > 1024 ? `${httpBody.slice(0, 1021).trim()}...` : httpBody;
  const details = (
    <div className={`ErrorMessage--details ${className || ''} u-simple-scrollbars`}>
      <table className="ErrorMessage--detailsTable">
        <tbody>
          {httpStatus ? <ErrorAttr name="Status" value={httpStatus} /> : null}
          {httpStatusText ? <ErrorAttr name="Status text" value={httpStatusText} /> : null}
          {httpUrl ? <ErrorAttr name="URL" value={httpUrl} /> : null}
          {httpQuery ? <ErrorAttr name="Query" value={httpQuery} /> : null}
          {bodyExcerpt ? <ErrorAttr name="Response body" value={bodyExcerpt} /> : null}
        </tbody>
      </table>
    </div>
  );

  if (wrap) {
    return <div className={`ErrorMessage ${wrapperClassName || ''}`}>{details}</div>;
  }
  return details;
}

Details.defaultProps = {
  className: undefined,
  wrap: false,
  wrapperClassName: undefined,
};

export default function ErrorMessage({
  className,
  detailClassName,
  error,
  messageClassName,
}: ErrorMessageProps) {
  if (!error) {
    return null;
  }
  if (typeof error === 'string') {
    return <Message className={messageClassName} error={error} wrapperClassName={className} wrap />;
  }
  return (
    <div className={`ErrorMessage ${className || ''}`}>
      <Message error={error} className={messageClassName} />
      <Details error={error} className={detailClassName} />
    </div>
  );
}

ErrorMessage.defaultProps = {
  className: undefined,
  detailClassName: undefined,
  messageClassName: undefined,
};

ErrorMessage.Message = Message;
ErrorMessage.Details = Details;
